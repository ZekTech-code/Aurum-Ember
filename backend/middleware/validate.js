import crypto from 'crypto';
import process from 'node:process';

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 100000000 && Number.isFinite(num);
}

export function isValidRef(ref) {
  return typeof ref === 'string' && ref.length >= 6 && ref.length <= 100 && /^[A-Za-z0-9_-]+$/.test(ref);
}

export function sanitizeString(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().substring(0, maxLength);
}

export function validatePaymentInit(req, res, next) {
  const { email, amount } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
  if (amount === undefined || amount === null) return res.status(400).json({ error: 'Amount is required' });
  if (!isValidAmount(amount)) return res.status(400).json({ error: 'Invalid amount' });

  req.body.email = email.toLowerCase().trim();
  req.body.amount = Number(amount);
  next();
}

export function verifyWebhookSignature(req, res, next) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret || secret.includes('placeholder')) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Webhook not configured' });
    }
    console.warn('[Webhook] No webhook secret configured - skipping signature verification (dev mode)');
    return next();
  }

  const signature = req.headers['x-paystack-signature'];
  if (!signature) return res.status(400).json({ error: 'Missing webhook signature' });

  const rawBody = req.rawBody || req.body;
  const rawString = typeof rawBody === 'string' ? rawBody : rawBody.toString();
  const hash = crypto.createHmac('sha512', secret).update(rawString).digest('hex');

  if (hash !== signature) {
    console.warn('[Webhook] Invalid signature received');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    req.body = typeof rawBody === 'string' ? JSON.parse(rawString) : JSON.parse(rawString);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  next();
}
