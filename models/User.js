const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'logistics', 'admin', 'moderator'],
      default: 'farmer'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active'
    },
    location: String,
    deliveries: { type: Number, default: 0 },
    joined: { type: Date, default: Date.now },
    avatar: String,
    suspendReason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
