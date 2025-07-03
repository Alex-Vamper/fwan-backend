// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users?page=1&limit=50
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ users, total });
  } catch (err) {
    console.error('❌ Error in GET /api/users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
