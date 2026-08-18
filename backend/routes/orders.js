import { Router } from 'express';
import process from 'node:process';
import { db } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/validate.js';

const router = Router();

router.get('/notifications', authenticateToken, async (req, res) => {
  const notifications = await db.get('order_notifications');
  if (req.user.role !== 'admin') {
    return res.json(notifications.filter((n) => n.userEmail === req.user.email));
  }
  res.json(notifications);
});

router.post('/notifications', authenticateToken, async (req, res) => {
  const { title, desc, type } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const notif = await db.insert('order_notifications', {
    title: sanitizeString(title, 200),
    desc: sanitizeString(desc || '', 500),
    type: type || 'order',
    isRead: false,
    time: new Date().toISOString(),
  });
  res.status(201).json(notif);
});

router.put('/notifications/:id', authenticateToken, async (req, res) => {
  const updated = await db.updateById('order_notifications', req.params.id, { isRead: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json(updated);
});

router.get('/delivery-fee', (req, res) => {
  const { state, city } = req.query;

  if (!state || !city) {
    return res.status(400).json({ error: 'state and city are required' });
  }

  const restaurantState = (process.env.RESTAURANT_STATE || 'lagos').toLowerCase();
  const restaurantCity = (process.env.RESTAURANT_CITY || 'lagos').toLowerCase();

  const normalizedState = state.toLowerCase();
  const normalizedCity = city.toLowerCase();

  if (normalizedCity === restaurantCity && normalizedState === restaurantState) {
    return res.json({ deliveryFee: 500, zone: 'same_city' });
  }

  if (normalizedState === restaurantState) {
    return res.json({ deliveryFee: 1000, zone: 'same_state' });
  }

  return res.json({ deliveryFee: 2000, zone: 'different_state' });
});

router.get('/', authenticateToken, async (req, res) => {
  let orders = await db.get('orders');

  // Auto-cancel unpaid, not-delivered orders older than 5 minutes
  const now = Date.now();
  const fiveMin = 5 * 60 * 1000;
  const uncancellable = ['delivered','cancelled'];
  for (const o of orders) {
    const isUnpaid = o.paymentStatus === 'pending' || o.paymentStatus === 'unpaid';
    const isStale = !uncancellable.includes(o.status) && (now - new Date(o.date || o.createdAt).getTime()) > fiveMin;
    if (o.paymentMethod !== 'pay_on_delivery' && isUnpaid && isStale) {
      await db.updateById('orders', o._id, { status: 'cancelled', paymentStatus: 'failed', cancelledAt: new Date().toISOString() });
      const userList = await db.query('users', u => u.email === o.userEmail);
      const user = userList.length ? userList[0] : null;
      if (user) {
        const note = user.notifications || [];
        note.unshift({ _id: Date.now().toString() + Math.random().toString(36).substring(2, 4), message: `Payment for order #${o._id} was not completed. Your order has been cancelled.`, read: false, createdAt: new Date().toISOString() });
        await db.updateById('users', user._id, { notifications: note });
      }
    }
  }

  // Reload to reflect auto-cancels
  orders = await db.get('orders');

  if (req.user.role !== 'admin') {
    orders = orders.filter((o) => o.userEmail === req.user.email || o.userId === req.user.id);
  }

  const { status, userEmail, search, page, limit } = req.query;
  if (status) orders = orders.filter((o) => o.status === status);
  if (userEmail) orders = orders.filter((o) => o.userEmail === userEmail);

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        (o._id && String(o._id).toLowerCase().includes(q)) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.paymentRef && o.paymentRef.toLowerCase().includes(q))
    );
  }

  orders.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  if (page && limit) {
    const start = (Number(page) - 1) * Number(limit);
    orders = orders.slice(start, start + Number(limit));
  }

  res.json(orders);
});

router.post('/', authenticateToken, async (req, res) => {
  const { items, deliveryInfo, subtotal, deliveryFee, totalAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required and must not be empty' });
  }

  if (items.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 items per order' });
  }

  if (!deliveryInfo || typeof deliveryInfo !== 'object') {
    return res.status(400).json({ error: 'deliveryInfo is required' });
  }

  const computedSubtotal = subtotal || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedDeliveryFee = deliveryFee || 0;
  const computedTotal = totalAmount || computedSubtotal + computedDeliveryFee;

  if (computedSubtotal < 0 || computedSubtotal > 999999 || computedTotal < 0 || computedTotal > 999999) {
    return res.status(400).json({ error: 'Invalid amount values' });
  }

  const order = await db.insert('orders', {
    ...req.body,
    userId: req.user.id,
    userEmail: req.user.email,
    items,
    deliveryInfo,
    subtotal: computedSubtotal,
    deliveryFee: computedDeliveryFee,
    totalAmount: computedTotal,
    status: req.body.status || 'awaiting',
    paymentStatus: req.body.paymentStatus || 'pending',
    date: req.body.date || new Date().toISOString(),
  });
  res.status(201).json(order);
});

router.put('/:orderId', authenticateToken, async (req, res) => {
  const existing = await db.findById('orders', req.params.orderId);
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role !== 'admin' && existing.userEmail !== req.user.email) {
    return res.status(403).json({ error: 'Not authorized to update this order' });
  }

  let updates = {};
  if (req.user.role === 'admin') {
    const { status, paymentStatus, ...extraData } = req.body;
    updates = { ...extraData };
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
  } else {
    const allowedFields = ['deliveryInfo', 'notes'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
  }

  const order = await db.updateById('orders', req.params.orderId, updates);
  res.json(order);
});

router.put('/:orderId/mark-paid', authenticateToken, requireAdmin, async (req, res) => {
  const existing = await db.findById('orders', req.params.orderId);
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  if (existing.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Order is already marked as paid' });
  }

  const { paymentMethod, notes } = req.body;
  const updatedOrder = await db.updateById('orders', req.params.orderId, {
    paymentStatus: 'paid',
    paidAt: new Date().toISOString(),
    paidBy: req.user.email,
  });

  const reference = `AE-DEL-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const payment = await db.insert('payments', {
    reference,
    paystackRef: null,
    email: existing.userEmail || req.user.email,
    amount: existing.totalAmount || 0,
    currency: 'USD',
    method: paymentMethod || 'pay_on_delivery',
    status: 'paid',
    orderId: existing._id,
    paidAt: new Date().toISOString(),
    paidBy: req.user.email,
    auditLog: [
      {
        action: 'marked_paid',
        actor: req.user.email,
        fromStatus: existing.paymentStatus || 'pending',
        toStatus: 'paid',
        details: { notes: notes || 'Marked as paid by admin', paymentMethod: paymentMethod || 'pay_on_delivery' },
        timestamp: new Date().toISOString(),
      },
    ],
  });

  res.json({ order: updatedOrder, payment });
});

router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  const existing = await db.findById('orders', req.params.orderId);
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role !== 'admin' && existing.userEmail !== req.user.email) {
    return res.status(403).json({ error: 'Not authorized to cancel this order' });
  }

  const order = await db.updateById('orders', req.params.orderId, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelledBy: req.user.email,
  });
  res.json(order);
});

router.get('/:orderId/payment-status', async (req, res) => {
  const order = await db.findById('orders', req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.json({
    paymentStatus: order.paymentStatus || 'pending',
    paymentMethod: order.paymentMethod || null,
    paymentRef: order.paymentRef || null,
    status: order.status,
  });
});

router.delete('/:orderId', authenticateToken, requireAdmin, async (req, res) => {
  const deleted = await db.deleteById('orders', req.params.orderId);
  if (!deleted) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Order deleted' });
});

router.delete('/', authenticateToken, requireAdmin, async (req, res) => {
  await db.set('orders', []);
  await db.set('order_notifications', []);
  res.json({ message: 'All orders cleared' });
});

export default router;
