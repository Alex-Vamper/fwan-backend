import express from 'express';
import Crate from '../models/Crate.js';
import Activity from '../models/Activity.js';
import authMiddleware from '../middleware/authMiddleware.js'; // ✅
import authenticateToken from '../middleware/authenticateToken.js';
import { createNotification } from '../utils/notifications.js'; // <-- adjust path if needed

const router = express.Router();

// Helper to log activity without blocking or crashing the main flow
async function logActivity(activity) {
  try {
    await Activity.create(activity);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

/**
 * Route: PATCH /api/crates/:crateId/thresholds
 * Purpose: Update crate threshold for ESP device
 */
router.patch('/:crateId/thresholds', authMiddleware, async (req, res) => {
  console.log(`📡 Threshold route hit for ${req.params.crateId}`);

  try {
    const { crateId } = req.params;
    const { temperatureMin, temperatureMax, humidityMin, humidityMax } = req.body;

    const crate = await Crate.findOne({ crateId, userId: req.user.userId });
    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    crate.thresholds.temperature.min = temperatureMin;
    crate.thresholds.temperature.max = temperatureMax;
    crate.thresholds.humidity.min = humidityMin;
    crate.thresholds.humidity.max = humidityMax;

    await crate.save();
    res.json({ message: 'Thresholds updated', crate });
  } catch (err) {
    console.error('Threshold update error:', err);
    res.status(500).json({ error: 'Failed to update thresholds' });
  }
});

/**
 * Route: GET /api/crates/:crateId/thresholds
 * Purpose: Fetch current threshold settings for crate
 */
router.get('/:crateId/thresholds', authMiddleware, async (req, res) => {
  try {
    const crate = await Crate.findOne({ crateId: req.params.crateId, userId: req.user.userId });
    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    const { temperature, humidity } = crate.thresholds || {};
    res.json({
      temperatureMin: temperature?.min,
      temperatureMax: temperature?.max,
      humidityMin: humidity?.min,
      humidityMax: humidity?.max,
    });
  } catch (err) {
    console.error('Error fetching thresholds:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * Route: POST /api/crates/register
 * Purpose: Register a new crate
 */
router.post('/register', authMiddleware, async (req, res) => {
  const { crateId, assignedWarehouse } = req.body;

  if (!crateId || !assignedWarehouse) {
    return res.status(400).json({ error: 'crateId and assignedWarehouse are required' });
  }

  try {
    const existing = await Crate.findOne({ crateId });
    if (existing) {
      return res.status(400).json({ error: 'Crate with this ID already exists' });
    }

    const newCrate = new Crate({
      crateId,
      assignedWarehouse,
      userId: req.user.userId  // 👈 Associate crate with the current user
    });

    await newCrate.save();

    // Log activity
    await logActivity({
      type: 'crate',
      message: `New crate registered: ${newCrate.crateId}`,
      status: 'success',
      relatedId: newCrate.crateId
    });

    // Create notification
    await createNotification({
      type: 'crate',
      message: `New crate registered: ${newCrate.crateId}`,
      status: 'success',
      relatedId: newCrate.crateId
    });

    res.status(201).json({ message: 'Crate registered successfully', crate: newCrate });
  } catch (err) {
    console.error('❌ Crate registration error:', err);
    res.status(500).json({ error: 'Failed to register crate', details: err.message });
  }
});

/**
 * Route: GET /api/crates
 * Purpose: Fetch all crates (only for logged-in user)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const crates = await Crate.find({ userId: req.user.userId }).lean(); // 👈 Filter by user
    const formatted = crates.map(crate => ({
      ...crate,
      crateId: crate.crateId || crate._id?.toString(),
    }));
    res.json({ crates: formatted });
  } catch (err) {
    console.error('❌ Error fetching crates:', err);
    res.status(500).json({ error: 'Failed to fetch crates' });
  }
});


/**
 * Route: GET /api/crates/:crateId/telemetry
 * Purpose: Get only telemetry data for crate (restricted to owner)
 */
router.get('/:crateId/telemetry', authMiddleware, async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId, userId: req.user.userId });
    if (!crate) {
      return res.status(404).json({ message: 'Crate not found or unauthorized' });
    }

    const telemetry = {
      temperature: crate.temperature,
      humidity: crate.humidity,
      status: crate.status,
      crateStatus: crate.crateStatus,
      locationDetails: crate.locationDetails,
      lastUpdate: crate.lastUpdate,
      condition: crate.condition,
      coolingUnit: crate.coolingUnit,
      sensors: crate.sensors,
    };

    res.json(telemetry);
  } catch (err) {
    console.error('❌ Error fetching crate telemetry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Route: GET /api/crates/:crateId
 * Purpose: Get a single crate (restricted to owner)
 */
router.get('/:crateId', authMiddleware, async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId, userId: req.user.userId }).lean();
    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    crate.crateId = crate.crateId || crate._id?.toString();
    res.json({ crate });
  } catch (err) {
    console.error('Error fetching crate:', err);
    res.status(500).json({ error: 'Failed to fetch crate' });
  }
});


/**
 * Route: PATCH /api/crates/:crateId
 * Purpose: Update telemetry and status
 */
router.patch('/:crateId', authenticateToken, async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId, userId: req.user.userId });
    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    const {
      temperature, humidity, condition, crateStatus,
      coolingUnit, sensors, locationDetails, linkedOrder,
      assignedWarehouse, tempUpper, tempLower, humidityUpper, humidityLower,
    } = req.body;

    console.log('📥 Incoming telemetry for crate:', crateId);

    if (temperature !== undefined) crate.temperature = temperature;
    if (humidity !== undefined) crate.humidity = humidity;
    if (condition !== undefined) crate.condition = condition;
    if (crateStatus !== undefined) crate.crateStatus = crateStatus;
    if (coolingUnit !== undefined) crate.coolingUnit = coolingUnit;
    if (sensors !== undefined) crate.sensors = sensors;
    if (locationDetails !== undefined) crate.locationDetails = locationDetails;
    if (linkedOrder !== undefined) crate.linkedOrder = linkedOrder;
    if (assignedWarehouse !== undefined) crate.assignedWarehouse = assignedWarehouse;
    if (tempUpper !== undefined) crate.tempUpper = tempUpper;
    if (tempLower !== undefined) crate.tempLower = tempLower;
    if (humidityUpper !== undefined) crate.humidityUpper = humidityUpper;
    if (humidityLower !== undefined) crate.humidityLower = humidityLower;

    if (
      crateStatus === 'Closed' &&
      coolingUnit === 'Active' &&
      sensors === 'Live'
    ) {
      crate.status = 'in_transit';
      console.log('🚚 Auto status change to in_transit triggered.');
    }

    crate.lastUpdate = new Date();
    await crate.save();

    console.log('✅ Crate updated and saved to DB.\n');

    res.json({ message: 'Crate updated successfully', crate });
  } catch (err) {
    console.error('❌ Error in PATCH /api/crates/:crateId:', err);
    res.status(500).json({ error: 'Failed to update crate' });
  }
});

/**
 * Route: POST /api/crates/:crateId/assign-order
 * Purpose: Assign crate to an order
 */
router.post('/:crateId/assign-order', authenticateToken, async (req, res) => {
  const { crateId } = req.params;
  const { linkedOrder, location } = req.body;

  try {
    const crate = await Crate.findOne({ crateId, userId: req.user.userId });
    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    crate.linkedOrder = linkedOrder;
    crate.location = location;
    crate.status = 'in_transit';

    await crate.save();

    const message = `Crate ${crateId} assigned to order ${linkedOrder}`;

    const { createNotification } = await import('../utils/notifications.js');
    await createNotification({
      type: 'crate',
      message,
      status: 'success',
      relatedId: crateId
    });

    res.json({ message: 'Crate assigned successfully' });
  } catch (err) {
    console.error('❌ Error assigning crate:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * Route: DELETE /api/crates/:crateId
 * Purpose: Permanently delete crate
 * Access: Authenticated + Owner only
 */
router.delete('/:crateId', authenticateToken, async (req, res) => {
  const { crateId } = req.params;

  try {
    const deleted = await Crate.findOneAndDelete({
      $or: [
        { _id: crateId },
        { crateId: crateId }
      ],
      userId: req.user.id
    });


    if (!deleted) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    await logActivity({
      type: 'crate',
      message: `Crate ${crateId} was deleted`,
      status: 'error',
      relatedId: crateId
    });

    const { createNotification } = await import('../utils/notifications.js');

    await createNotification({
      type: 'crate',
      message: `Crate ${crateId} was deleted`,
      status: 'error',
      relatedId: crateId
    });

    res.json({ message: `Crate ${crateId} deleted successfully` });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Failed to delete crate' });
  }
});

/**
 * Route: PATCH /api/crates/:crateId/flag
 * Purpose: Flag a crate with issue type and description
 * Access: Authenticated + Owner only
 */
router.patch('/:crateId/flag', authenticateToken, async (req, res) => {
  const { crateId } = req.params;
  const { reason, description } = req.body;

  console.log(`🚩 Flag route hit for ${crateId}`);

  try {
    const crate = await Crate.findOne({
      $or: [
        { _id: crateId },
        { crateId: crateId }
      ],
      userId: req.user.id
    });



    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    if (crate.status !== 'flagged') {
      crate.previousStatus = crate.status;
    }

    crate.status = 'flagged';
    crate.condition = 'flagged';
    crate.flagDetails = { reason, description };

    await crate.save();

    const message = `Crate ${crateId} flagged: ${reason} - ${description || 'No description'}`;

    await logActivity({
      type: 'crate',
      message,
      status: 'warning',
      relatedId: crateId
    });

    const { createNotification } = await import('../utils/notifications.js');

    await createNotification({
      type: 'crate',
      message,
      status: 'warning',
      relatedId: crateId
    });

    res.json({ message: '✅ Crate flagged successfully', crate });
  } catch (err) {
    console.error('❌ Error flagging crate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Route: PATCH /api/crates/:crateId/resolve
 * Purpose: Restore flagged crate to previous status
 * Access: Authenticated + Owner only
 */
router.patch('/:crateId/resolve', authenticateToken, async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({
      crateId,
      userId: req.user.id // 🔒 Only resolve if owned by logged-in user
    });

    if (!crate) return res.status(404).json({ error: 'Crate not found or unauthorized' });

    crate.status = crate.previousStatus || 'available';
    crate.previousStatus = null;
    crate.condition = 'Excellent';
    crate.flagDetails = null;

    await crate.save();

    const message = `Flag resolved for crate ${crateId}, status restored to ${crate.status}`;

    await logActivity({
      type: 'crate',
      message,
      status: 'success',
      relatedId: crateId
    });

    const { createNotification } = await import('../utils/notifications.js');

    await createNotification({
      type: 'crate',
      message,
      status: 'success',
      relatedId: crateId
    });

    res.json({ message: 'Crate resolved successfully.' });
  } catch (err) {
    console.error('❌ Resolve error:', err);
    res.status(500).json({ error: 'Server error resolving crate flag.' });
  }
});

export default router;
