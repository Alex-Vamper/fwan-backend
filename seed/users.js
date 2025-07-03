const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');

const seedUsers = async () => {
  await connectDB();
  await User.deleteMany();

  await User.insertMany([
    {
      name: 'Alice Farmer',
      email: 'alice@fwan.io',
      role: 'farmer',
      status: 'active',
      location: 'Kaduna',
    },
    {
      name: 'Bob Buyer',
      email: 'bob@fwan.io',
      role: 'buyer',
      status: 'pending',
      location: 'Lagos',
    },
  ]);

  console.log('✅ Users seeded');
  process.exit();
};

seedUsers();
