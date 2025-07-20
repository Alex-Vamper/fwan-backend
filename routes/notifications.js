import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET all notifications (most recent first)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ time: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH mark one notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
