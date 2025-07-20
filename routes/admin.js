// routes/admin.js
import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// PUT /api/admin/profile
router.put('/profile', async (req, res) => {
  console.log('➡️ Received profile update:', req.body);

  try {
    const { fullName, email, phone, location, bio } = req.body;

    // Grab any admin in DB (simulate auth for now)
    const [admin] = await Admin.find();
    const adminId = admin?._id;

    console.log('🧪 Admin ID used:', adminId);

    if (!adminId) {
      return res.status(404).json({ message: 'No admin found in database' });
    }

    // Validate required fields
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

    console.log('✅ Admin updated successfully:', updatedAdmin);
    res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/password
router.patch('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const [admin] = await Admin.find();
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Simulated password match check (replace with real hash later)
    if (admin.password !== currentPassword) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; // ✅ ESM-compliant
