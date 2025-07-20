import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  location: String,
  bio: String,
  password: String, // for password change if needed
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
