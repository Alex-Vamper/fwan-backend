import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ✅ ADDED THIS
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

const User = mongoose.model('User', userSchema);
export default User;
