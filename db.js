const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://ghostrevamper:dgv2y5TwIgvYHjVc@fwan-db.d0wwvq1.mongodb.net/fwan?retryWrites=true&w=majority&appName=fwan-db';

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
