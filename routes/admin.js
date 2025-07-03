const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// PUT /api/admin/profile
router.put('/profile', async (req, res) => {
    console.log('➡️ Received profile update:', req.body);
  try {
    const { fullName, email, phone, location, bio } = req.body;

    // OPTIONAL: Replace with real auth to get admin ID
    const adminId = '64abc1234deffedcba09876f'; // hardcoded or from req.user.id

    // Validate required fields (optional strictness)
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { fullName, email, phone, location, bio },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
