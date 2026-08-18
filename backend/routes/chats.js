import { Router } from 'express';
import { db } from '../store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  let chats = await db.get('chats');

  if (req.user.role !== 'admin') {
    chats = chats.filter(c => c.userId === req.user.id);
  }

  chats.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  res.json(chats);
});

router.post('/message', authenticateToken, async (req, res) => {
  const { userId, text, sender = 'user', metadata = {} } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'userId and text required' });

  const chats = await db.query('chats', c => c.userId === userId);
  const chat = chats[0];

  const message = {
    _id: Date.now().toString(),
    text,
    sender,
    metadata,
    timestamp: new Date().toISOString(),
    isEdited: false,
  };

  if (!chat) {
    await db.insert('chats', {
      userId,
      messages: [message],
      lastMessage: text,
      lastTimestamp: message.timestamp,
      unreadCount: sender === 'user' ? 1 : 0,
      status: 'active',
      isPinned: false,
      isArchived: false,
    });
  } else {
    const messages = [...(chat.messages || []), message];
    const updates = {
      messages,
      lastMessage: text,
      lastTimestamp: message.timestamp,
      unreadCount: sender === 'user' ? (chat.unreadCount || 0) + 1 : chat.unreadCount || 0,
    };
    await db.updateById('chats', chat._id, updates);
  }

  res.status(201).json({ message: 'Message sent' });
});

router.delete('/message', authenticateToken, async (req, res) => {
  const { userId, messageId } = req.body;
  if (!userId || !messageId) return res.status(400).json({ error: 'userId and messageId required' });

  const chats = await db.query('chats', c => c.userId === userId);
  const chat = chats[0];
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const messages = (chat.messages || []).filter(m => m._id !== messageId);
  await db.updateById('chats', chat._id, {
    messages,
    lastMessage: messages.length ? messages[messages.length - 1].text : '',
    lastTimestamp: messages.length ? messages[messages.length - 1].timestamp : null,
  });

  res.json({ message: 'Message deleted' });
});

router.put('/field', authenticateToken, async (req, res) => {
  const { userId, field, value } = req.body;
  if (!userId || !field) return res.status(400).json({ error: 'userId and field required' });

  const chats = await db.query('chats', c => c.userId === userId);
  const chat = chats[0];
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const updates = {};

  if (field === 'unreadCount') {
    updates.unreadCount = value ?? 0;
  } else if (field === 'status') {
    updates.status = chat.status === 'resolved' ? 'active' : 'resolved';
  } else if (field === 'isPinned') {
    updates.isPinned = !chat.isPinned;
  } else if (field === 'isArchived') {
    updates.isArchived = !chat.isArchived;
  } else {
    updates[field] = value !== undefined ? value : !chat[field];
  }

  const updated = await db.updateById('chats', chat._id, updates);
  res.json(updated);
});

router.put('/edit', authenticateToken, async (req, res) => {
  const { userId, messageId, newText } = req.body;
  if (!userId || !messageId || !newText) return res.status(400).json({ error: 'userId, messageId and newText required' });

  const chats = await db.query('chats', c => c.userId === userId);
  const chat = chats[0];
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const messages = (chat.messages || []).map(m =>
    m._id === messageId ? { ...m, text: newText, isEdited: true } : m
  );
  await db.updateById('chats', chat._id, { messages });

  res.json({ message: 'Message edited' });
});

router.delete('/:userId', authenticateToken, async (req, res) => {
  const deleted = await db.deleteById('chats', req.params.userId);
  if (!deleted) return res.status(404).json({ error: 'Chat not found' });
  res.json({ message: 'Conversation deleted' });
});

export default router;
