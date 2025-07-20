import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: String,
  message: String,
  status: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
  relatedId: { type: String, default: null }
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
