import { Router } from 'express';
import { db } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const riders = await db.get('riders');
  res.json(riders);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const rider = await db.insert('riders', {
    name: req.body.name,
    status: req.body.status || 'available',
    activeDeliveries: 0,
    rating: req.body.rating || 0,
    vehicle: req.body.vehicle || '',
    avatar: req.body.avatar || '',
    phone: req.body.phone || '',
  });
  res.status(201).json(rider);
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const rider = await db.updateById('riders', req.params.id, req.body);
  if (!rider) return res.status(404).json({ error: 'Rider not found' });
  res.json(rider);
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const deleted = await db.deleteById('riders', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Rider not found' });
  res.json({ message: 'Rider deleted' });
});

export default router;
