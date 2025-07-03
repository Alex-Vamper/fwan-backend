const Notification = require('../models/Notification');

const createNotification = async ({ type, message, status = 'info', relatedId = null }) => {
  try {
    const newNotification = new Notification({
      type,
      message,
      status,
      relatedId,
      read: false,
      time: new Date()
    });
    await newNotification.save();

    // ✅ Add this log to confirm saving
    console.log('✅ Notification saved:', {
      type, message, status, relatedId
    });
  } catch (err) {
    console.error('❌ Notification creation failed:', err.message);
  }
};

module.exports = { createNotification };
