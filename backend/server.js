import process from 'node:process';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { securityHelmet, corsConfig, generalLimiter } from './middleware/security.js';
import { connectToMongo, closeMongo } from './store.js';

import mealsRouter from './routes/meals.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';
import chatsRouter from './routes/chats.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import reservationsRouter from './routes/reservations.js';
import ridersRouter from './routes/riders.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(securityHelmet);
app.use(corsConfig);
app.use(generalLimiter);

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/meals', mealsRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/riders', ridersRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function start() {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`\n  Aurum & Ember backend running on http://localhost:${PORT}`);
      console.log(`  Security: Helmet ✓ | CORS ✓ | Rate Limiting ✓`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`  Paystack: ${process.env.PAYSTACK_SECRET_KEY?.includes('placeholder') ? 'Demo mode (placeholder keys)' : 'Live mode'}`);
      }
    });
  } catch (err) {
    console.error('[Startup] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await closeMongo();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeMongo();
  process.exit(0);
});

start();
