import { Router } from 'express';
import process from 'node:process';
import { db } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  initializeTransaction,
  verifyTransaction,
  createDedicatedAccount,
  generateReference,
  isDemoMode,
} from '../services/paystack.js';
import {
  validatePaymentInit,
  verifyWebhookSignature,
  isValidRef,
  isValidEmail,
} from '../middleware/validate.js';
import { paymentInitLimiter, paymentVerifyLimiter } from '../middleware/security.js';

const router = Router();

async function storePayment(data) {
  return db.insert('payments', {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

async function addAuditEntry(paymentId, action, actor, fromStatus, toStatus, details = {}) {
  const payment = await db.findById('payments', paymentId);
  if (!payment) return;

  const auditLog = payment.auditLog || [];
  auditLog.push({
    action,
    actor: actor || 'system',
    fromStatus,
    toStatus,
    details,
    timestamp: new Date().toISOString(),
  });

  await db.updateById('payments', paymentId, { auditLog });
}

async function updateOrderPayment(orderId, paymentStatus, paymentMethod, paymentRef) {
  const order = await db.findById('orders', orderId);
  if (!order) return;

  const updates = { paymentStatus };
  if (paymentMethod) updates.paymentMethod = paymentMethod;
  if (paymentRef) updates.paymentRef = paymentRef;
  if (paymentStatus === 'paid') updates.paidAt = new Date().toISOString();

  await db.updateById('orders', orderId, updates);
}

router.post('/initialize', authenticateToken, paymentInitLimiter, validatePaymentInit, async (req, res) => {
  try {
    const { email, amount, metadata, channels, paymentMethod } = req.body;
    const reference = generateReference();
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success`;

    const response = await initializeTransaction({
      email,
      amount,
      reference,
      metadata: metadata || {},
      channels,
      callback_url: callbackUrl,
    });

    if (!response.status) {
      return res.status(402).json({ error: response.message || 'Payment initialization failed' });
    }

    const payment = await storePayment({
      reference,
      paystackRef: response.data?.reference || null,
      email,
      amount,
      currency: 'USD',
      method: paymentMethod || 'card',
      status: 'initialized',
      metadata: metadata || {},
      initiatedBy: req.user?.email || email,
    });

    await addAuditEntry(payment._id, 'initialized', req.user?.email || email, null, 'initialized');

    res.status(201).json({
      status: true,
      data: {
        authorization_url: response.data?.authorization_url,
        access_code: response.data?.access_code,
        reference,
      },
      payment,
    });
  } catch (error) {
    console.error('[Payment Init Error]', error.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

router.post('/virtual-account', authenticateToken, paymentInitLimiter, async (req, res) => {
  try {
    const { email, amount, reference } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const ref = reference || generateReference('AE-VB');

    const result = await createDedicatedAccount({
      email,
      amount: Number(amount),
      reference: ref,
    });

    await storePayment({
      reference: ref,
      email,
      amount: Number(amount),
      currency: 'USD',
      method: 'bank_transfer',
      status: 'virtual_account_created',
      virtualAccount: result.data,
      initiatedBy: req.user?.email || email,
    });

    res.status(201).json({ status: true, data: result.data });
  } catch (error) {
    console.error('[Virtual Account Error]', error.message);
    res.status(500).json({ error: 'Failed to create virtual account' });
  }
});

router.post('/status', authenticateToken, paymentVerifyLimiter, async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference || !isValidRef(reference)) {
      return res.status(400).json({ error: 'Valid reference is required' });
    }

    const payments = await db.query('payments', (p) => p.reference === reference);
    const payment = payments[0];

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.json({ status: true, paymentStatus: 'paid', payment });
    }

    const response = await verifyTransaction(reference);

    if (response.status && response.data?.status === 'success') {
      const oldStatus = payment.status;
      const updatedPayment = await db.updateById('payments', payment._id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        gatewayResponse: response.data,
      });

      await addAuditEntry(payment._id, 'verified', 'paystack_webhook', oldStatus, 'paid', {
        gatewayAmount: response.data.amount,
        channel: response.data.channel,
      });

      if (payment.orderId) {
        await updateOrderPayment(payment.orderId, 'paid', payment.method, reference);
      }

      return res.json({ status: true, paymentStatus: 'paid', payment: updatedPayment });
    }

    if (response.status && response.data?.status === 'failed') {
      const oldStatus = payment.status;
      await db.updateById('payments', payment._id, {
        status: 'failed',
        gatewayResponse: response.data,
      });
      await addAuditEntry(payment._id, 'failed', 'paystack_webhook', oldStatus, 'failed');
    }

    res.json({ status: false, paymentStatus: payment.status, message: 'Payment not yet confirmed' });
  } catch (error) {
    console.error('[Payment Status Error]', error.message);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

router.get('/verify/:reference', authenticateToken, paymentVerifyLimiter, async (req, res) => {
  try {
    const { reference } = req.params;

    if (!isValidRef(reference)) {
      return res.status(400).json({ error: 'Invalid reference format' });
    }

    const payments = await db.query('payments', (p) => p.reference === reference);
    const payment = payments[0];

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.json({ status: true, data: { status: 'success' }, payment });
    }

    const response = await verifyTransaction(reference);

    if (response.data?.status === 'success') {
      const oldStatus = payment.status;
      const updatedPayment = await db.updateById('payments', payment._id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        gatewayResponse: response.data,
      });

      await addAuditEntry(payment._id, 'verified', req.user?.email || 'user', oldStatus, 'paid');

      if (payment.orderId) {
        await updateOrderPayment(payment.orderId, 'paid', payment.method, reference);
      }

      return res.json({ status: true, data: response.data, payment: updatedPayment });
    }

    res.status(400).json({ status: false, data: response.data, message: 'Payment verification failed' });
  } catch (error) {
    console.error('[Payment Verify Error]', error.message);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

router.post('/webhook', verifyWebhookSignature, async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference } = event.data;

      const payments = await db.query('payments', (p) => p.reference === reference);
      const payment = payments[0];

      if (payment && payment.status !== 'paid') {
        const oldStatus = payment.status;
        await db.updateById('payments', payment._id, {
          status: 'paid',
          paidAt: new Date().toISOString(),
          gatewayResponse: event.data,
        });

        await addAuditEntry(payment._id, 'webhook_verified', 'paystack_webhook', oldStatus, 'paid', {
          event: event.event,
          channel: event.data?.channel,
          amount: event.data?.amount,
        });

        if (payment.orderId) {
          await updateOrderPayment(payment.orderId, 'paid', payment.method, reference);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook Error]', error.message);
    return res.status(200).json({ received: true });
  }
});

router.get('/config', (req, res) => {
  res.json({
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    demoMode: isDemoMode(),
  });
});

router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  const payments = await db.get('payments');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const paidPayments = payments.filter((p) => p.status === 'paid');

  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const todayRevenue = paidPayments
    .filter((p) => new Date(p.paidAt || p.createdAt) >= todayStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const weekRevenue = paidPayments
    .filter((p) => new Date(p.paidAt || p.createdAt) >= weekStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthRevenue = paidPayments
    .filter((p) => new Date(p.paidAt || p.createdAt) >= monthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const yearRevenue = paidPayments
    .filter((p) => new Date(p.paidAt || p.createdAt) >= yearStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successful = payments.filter((p) => p.status === 'paid').length;
  const pending = payments.filter((p) => p.status === 'pending' || p.status === 'initialized' || p.status === 'virtual_account_created').length;
  const failed = payments.filter((p) => p.status === 'failed').length;
  const total = payments.length;
  const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0';

  const methodBreakdown = {};
  payments.forEach((p) => {
    const method = p.method || 'unknown';
    if (!methodBreakdown[method]) {
      methodBreakdown[method] = { count: 0, totalAmount: 0, paid: 0, failed: 0 };
    }
    methodBreakdown[method].count++;
    methodBreakdown[method].totalAmount += p.amount || 0;
    if (p.status === 'paid') methodBreakdown[method].paid++;
    if (p.status === 'failed') methodBreakdown[method].failed++;
  });

  const dailyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - i);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayAmount = paidPayments
      .filter((p) => {
        const d = new Date(p.paidAt || p.createdAt);
        return d >= date && d < dayEnd;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    dailyRevenue.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      amount: dayAmount,
    });
  }

  res.json({
    summary: {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      yearRevenue,
      successful,
      pending,
      failed,
      total,
      successRate: Number(successRate),
    },
    methodBreakdown,
    dailyRevenue,
  });
});

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  let payments = await db.get('payments');

  const { status, method, search, page, limit, startDate, endDate } = req.query;

  if (status) payments = payments.filter((p) => p.status === status);
  if (method) payments = payments.filter((p) => p.method === method);

  if (startDate) {
    const start = new Date(startDate);
    payments = payments.filter((p) => new Date(p.createdAt) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    payments = payments.filter((p) => new Date(p.createdAt) <= end);
  }

  if (search) {
    const q = search.toLowerCase();
    payments = payments.filter(
      (p) =>
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.method && p.method.toLowerCase().includes(q))
    );
  }

  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = payments.length;

  if (page && limit) {
    const start = (Number(page) - 1) * Number(limit);
    payments = payments.slice(start, start + Number(limit));
  }

  res.json({ payments, total, page: Number(page) || 1, limit: Number(limit) || total });
});

router.get('/:reference', authenticateToken, async (req, res) => {
  if (!isValidRef(req.params.reference)) {
    return res.status(400).json({ error: 'Invalid reference format' });
  }

  const payments = await db.query('payments', (p) => p.reference === req.params.reference);
  const payment = payments[0];

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json(payment);
});

export default router;
