const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb://127.0.0.1:27017/fwan_crates';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
        
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Stop app if connection fails
  }
};

module.exports = connectDB;
