import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },   // e.g., 'crate', 'warehouse', 'order', 'user', etc.
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
  relatedId: String, // e.g. crateId, orderId, userId for reference
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
