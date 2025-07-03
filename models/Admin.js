const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  location: String,
  bio: String,
  password: String, // for password change if needed
});

module.exports = mongoose.model('Admin', AdminSchema);

