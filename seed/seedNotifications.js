const mongoose = require('mongoose');
const Notification = require('./models/Notification');

mongoose.connect('mongodb://localhost:27017/fwan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seed = async () => {
  await Notification.deleteMany();

  await Notification.insertMany([
    {
      message: 'New crate registered: CRT-A-001',
      type: 'user',
      status: 'success',
    },
    {
      message: 'Crate CRT-A-001 flagged for overheating',
      type: 'alert',
      status: 'warning',
    },
    {
      message: 'Order #12345 placed',
      type: 'order',
      status: 'success',
    },
    {
      message: 'System update deployed',
      type: 'system',
      status: 'success',
    }
  ]);

  console.log('Seeded notifications!');
  mongoose.disconnect();
};

seed();
