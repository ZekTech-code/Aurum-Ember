import process from 'node:process';
import helmet from 'helmet';
import cors from 'cors';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

export const securityHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.paystack.co'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.paystack.co'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", 'https://checkout.paystack.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
});

export const corsConfig = cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Paystack-Signature'],
  maxAge: 86400,
});

const windowMs = 15 * 60 * 1000;
const rateLimitStore = new Map();

function cleanupStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.resetTime > windowMs) rateLimitStore.delete(key);
  }
}
const cleanupInterval = setInterval(cleanupStore, windowMs);
if (cleanupInterval.unref) cleanupInterval.unref();

function createRateLimiter({ maxRequests = 100, windowMinutes = 15, keyPrefix = '' } = {}) {
  const windowMsLocal = windowMinutes * 60 * 1000;

  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now - entry.resetTime > windowMsLocal) {
      rateLimitStore.set(key, { count: 1, resetTime: now });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    const retryAfter = Math.ceil((entry.resetTime + windowMsLocal - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil((entry.resetTime + windowMsLocal) / 1000));

    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
  };
}

export const generalLimiter = createRateLimiter({ maxRequests: 2000, windowMinutes: 1, keyPrefix: 'gen' });
export const paymentInitLimiter = createRateLimiter({ maxRequests: 20, windowMinutes: 1, keyPrefix: 'pay_init' });
export const paymentVerifyLimiter = createRateLimiter({ maxRequests: 60, windowMinutes: 1, keyPrefix: 'pay_verify' });
export const authLimiter = createRateLimiter({ maxRequests: 20, windowMinutes: 15, keyPrefix: 'auth' });
