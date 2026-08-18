import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../store.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const users = (await db.get('users')).map((u) => { const s = { ...u }; delete s.password; return s; });
  res.json(users);
});

router.get('/profile', authenticateToken, async (req, res) => {
  const user = await db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safe = { ...user }; delete safe.password;
  res.json(safe);
});

router.put('/profile', authenticateToken, async (req, res) => {
  const allowedFields = ['name', 'phone', 'avatar', 'location', 'state', 'address', 'city', 'preferredPaymentMethod'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === 'string' ? req.body[field].substring(0, 500) : req.body[field];
    }
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
  const user = await db.updateById('users', req.user.id, updates);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safe = { ...user }; delete safe.password;
  res.json(safe);
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Invalid input' });

  const users = await db.query('users', u => u.email === email);
  const user = users[0];
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const token = generateToken({ id: user._id, email: user.email, name: user.name, role: user.role || 'user' });
  const safe = { ...user }; delete safe.password;
  res.json({ token, ...safe });
});

router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password, phone, avatar, location, state } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Name, email and password required' });
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') return res.status(400).json({ message: 'Invalid input' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (email.length > 254 || name.length > 100) return res.status(400).json({ message: 'Input too long' });

  const existing = await db.query('users', u => u.email === email);
  if (existing.length) return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.insert('users', { name, email, password: hashed, phone, avatar, location, state, role: 'user', status: 'active', cart: [], notifications: [] });
  const token = generateToken({ id: user._id, email: user.email, name: user.name, role: 'user' });
  const safe = { ...user }; delete safe.password;
  res.status(201).json({ token, ...safe });
});

router.post('/google-login', authLimiter, async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const users = await db.query('users', u => u.email === email);
  let user = users[0];
  if (!user) {
    user = await db.insert('users', { name, email, avatar, role: 'user', status: 'active', cart: [], notifications: [], password: '' });
  }

  const token = generateToken({ id: user._id, email: user.email, name: user.name, role: user.role || 'user' });
  const safe = { ...user }; delete safe.password;
  res.json({ token, ...safe });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
});

router.post('/notifications', authenticateToken, async (req, res) => {
  const { userId, userEmail, message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  let targetUser;
  if (userId) {
    targetUser = await db.findById('users', userId);
  } else if (userEmail) {
    const users = await db.query('users', u => u.email === userEmail);
    targetUser = users[0];
  }
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const notifications = targetUser.notifications || [];
  notifications.unshift({ _id: Date.now().toString(), message, read: false, createdAt: new Date().toISOString() });
  await db.updateById('users', targetUser._id, { notifications });
  res.json({ message: 'Notification sent' });
});

router.put('/notifications/:id', authenticateToken, async (req, res) => {
  const user = await db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const notifications = (user.notifications || []).map(n =>
    n._id === req.params.id ? { ...n, read: true } : n
  );
  await db.updateById('users', user._id, { notifications });
  res.json({ message: 'Notification marked as read' });
});

router.put('/notifications-read-all', authenticateToken, async (req, res) => {
  const user = await db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const notifications = (user.notifications || []).map(n => ({ ...n, read: true }));
  await db.updateById('users', user._id, { notifications });
  res.json({ message: 'All notifications marked as read' });
});

router.get('/cart', authenticateToken, async (req, res) => {
  const user = await db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.cart || []);
});

router.put('/cart', authenticateToken, async (req, res) => {
  const { cart } = req.body;
  if (!Array.isArray(cart)) return res.status(400).json({ error: 'Cart must be an array' });
  await db.updateById('users', req.user.id, { cart });
  res.json({ message: 'Cart updated' });
});

router.delete('/cart', authenticateToken, async (req, res) => {
  await db.updateById('users', req.user.id, { cart: [] });
  res.json({ message: 'Cart cleared' });
});

router.delete('/me', authenticateToken, async (req, res) => {
  const deleted = await db.deleteById('users', req.user.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Account deleted successfully' });
});

export default router;
