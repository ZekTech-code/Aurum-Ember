import { Router } from 'express';
import { db } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const reservations = await db.get('reservations');
  res.json(reservations);
});

router.post('/', async (req, res) => {
  const { customerName, email, phone, date, time, guests, specialRequests } = req.body;
  if (!customerName || !date || !time || !guests) {
    return res.status(400).json({ error: 'customerName, date, time and guests required' });
  }

  const reservation = await db.insert('reservations', {
    name: customerName,
    email,
    phone,
    date,
    time,
    guests: Number(guests),
    specialRequests: specialRequests || '',
    status: 'pending',
  });

  res.status(201).json(reservation);
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const reservation = await db.updateById('reservations', req.params.id, req.body);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const deleted = await db.deleteById('reservations', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Reservation not found' });
  res.json({ message: 'Reservation deleted' });
});

export default router;
