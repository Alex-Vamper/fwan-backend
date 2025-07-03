const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: String,
  message: String,
  status: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },

  // CHANGE THIS 👇
  relatedId: { type: String, default: null }
});

module.exports = mongoose.model('Notification', NotificationSchema);
