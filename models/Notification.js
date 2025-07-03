const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: String, // e.g., 'order', 'crate', 'system'
  message: String,
  status: { type: String, default: 'info' }, // 'success', 'warning', 'error', etc.
  read: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }
});

module.exports = mongoose.model('Notification', NotificationSchema);
