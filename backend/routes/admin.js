import { Router } from 'express';
import process from 'node:process';
import bcrypt from 'bcryptjs';
import { db } from '../store.js';
import { generateToken, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = Router();

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Invalid input' });

  const admins = await db.query('admins', a => a.email === email);
  const admin = admins[0];
  if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const token = generateToken({ id: admin._id, email: admin.email, name: admin.name, role: 'admin' });
  res.json({ token });
});

router.post('/register', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password required' });
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') return res.status(400).json({ error: 'Invalid input' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await db.query('admins', a => a.email === email);
  if (existing.length) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const admin = await db.insert('admins', { name, email, password: hashed, role: 'admin' });
  const safe = { ...admin }; delete safe.password;
  res.status(201).json({ message: 'Admin created', admin: safe });
});

router.post('/bootstrap', authLimiter, async (req, res) => {
  const admins = await db.get('admins');
  if (admins.length > 0) return res.status(400).json({ message: 'Admin already exists. Use login instead.' });

  const { name, email, password, setupToken } = req.body;
  if (!email || !password || !name || !setupToken) {
    return res.status(400).json({ message: 'Name, email, password and setup token required' });
  }
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const validToken = process.env.ADMIN_SETUP_TOKEN;
  if (!validToken) {
    return res.status(500).json({ message: 'Setup not configured on this server' });
  }
  if (setupToken !== validToken) {
    return res.status(403).json({ message: 'Invalid setup token' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await db.insert('admins', { name, email, password: hashed, role: 'admin' });
  const token = generateToken({ id: admin._id, email: admin.email, name: admin.name, role: 'admin' });
  res.status(201).json({ token });
});

router.get('/setup-status', async (req, res) => {
  const admins = await db.get('admins');
  res.json({ isConfigured: admins.length > 0 });
});

router.get('/profile', authenticateToken, requireAdmin, async (req, res) => {
  const admins = await db.query('admins', a => a._id === String(req.user.id));
  const admin = admins[0];
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  const safe = { ...admin }; delete safe.password;
  res.json(safe);
});

router.put('/profile', authenticateToken, requireAdmin, async (req, res) => {
  const admins = await db.query('admins', a => a._id === String(req.user.id));
  const admin = admins[0];
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const allowedFields = ['name', 'email', 'phone', 'location'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === 'string' ? req.body[field].substring(0, 500) : req.body[field];
    }
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields to update' });

  const updated = await db.updateById('admins', String(req.user.id), updates);
  if (!updated) return res.status(500).json({ message: 'Update failed' });
  const safe = { ...updated }; delete safe.password;
  res.json(safe);
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
});

router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  const admins = (await db.get('admins')).map((a) => { const s = { ...a }; delete s.password; return s; });
  res.json(admins);
});

router.delete('/:adminId', authenticateToken, requireAdmin, async (req, res) => {
  if (req.params.adminId === String(req.user.id)) return res.status(400).json({ error: 'Cannot delete yourself' });
  const deleted = await db.deleteById('admins', req.params.adminId);
  if (!deleted) return res.status(404).json({ error: 'Admin not found' });
  res.json({ message: 'Admin deleted' });
});

router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
  const notifications = await db.get('admin_notifications');
  res.json(notifications);
});

router.put('/notifications/:id', authenticateToken, requireAdmin, async (req, res) => {
  const updated = await db.updateById('admin_notifications', req.params.id, { isRead: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json(updated);
});

export default router;
