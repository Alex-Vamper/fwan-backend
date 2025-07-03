const Activity = require('../models/Activity');
const express = require('express');
const router = express.Router();
const Crate = require('../models/Crate');

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
router.patch('/:crateId/thresholds', async (req, res) => {
  console.log(`📡 Threshold route hit for ${req.params.crateId}`);

  try {
    const { crateId } = req.params;
    const { temperatureMin, temperatureMax, humidityMin, humidityMax } = req.body;

    const crate = await Crate.findOne({ crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

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
router.get('/:crateId/thresholds', async (req, res) => {
  try {
    const crate = await Crate.findOne({ crateId: req.params.crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

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
router.post('/register', async (req, res) => {
  const { crateId, assignedWarehouse } = req.body;

  if (!crateId || !assignedWarehouse) {
    return res.status(400).json({ error: 'crateId and assignedWarehouse are required' });
  }

  try {
    const existing = await Crate.findOne({ crateId });
    if (existing) {
      return res.status(400).json({ error: 'Crate with this ID already exists' });
    }

    const newCrate = new Crate({ crateId, assignedWarehouse });
    await newCrate.save();

    // Log activity
    await logActivity({
      type: 'crate',
      message: `New crate registered: ${newCrate.crateId}`,
      status: 'success',
      relatedId: newCrate.crateId
    });

    // Create notification
    const { createNotification } = require('../utils/notifications');

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
 * Purpose: Fetch all crates
 */
router.get('/', async (req, res) => {
  try {
    const crates = await Crate.find().lean(); // lean makes them plain JS
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
 * Purpose: Get only telemetry data for crate
 */
router.get('/:crateId/telemetry', async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId });
    if (!crate) {
      return res.status(404).json({ message: 'Crate not found' });
    }

    // Return only telemetry-related fields
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
 * Purpose: Get a single crate
 */
router.get('/:crateId', async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId }).lean();
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

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
router.patch('/:crateId', async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

    const {
      temperature, humidity, condition, crateStatus,
      coolingUnit, sensors, locationDetails, linkedOrder,
      assignedWarehouse, tempUpper, tempLower, humidityUpper, humidityLower,
    } = req.body;

    console.log('📥 Incoming telemetry for crate:', crateId);
    console.log('🌡 Temperature:', temperature);
    console.log('💧 Humidity:', humidity);
    console.log('📦 Crate Status:', crateStatus);
    console.log('❄ Cooling Unit:', coolingUnit);
    console.log('📡 Sensors:', sensors);

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

    // Auto status change logic
    if (
      crateStatus === 'Closed' &&
      coolingUnit === 'Active' &&
      sensors === 'Live'
    ) {
      crate.status = 'in_transit';
      console.log('🚚 Auto status change to in_transit triggered.');
    }

    console.log('🕒 lastUpdate =', new Date());

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
router.post('/:crateId/assign-order', async (req, res) => {
  const { crateId } = req.params;
  const { orderId, location } = req.body;

  try {
    const crate = await Crate.findOne({ crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

    crate.linkedOrder = orderId;
    crate.location = location;
    crate.status = 'in_transit';

    await crate.save();

    await logActivity({
      type: 'crate',
      message: `Crate ${crateId} assigned to order ${orderId}`,
      status: 'success',
      relatedId: crateId
    });

    // ✅ Add notification
    const { createNotification } = require('../utils/notifications');

    await createNotification({
      type: 'crate',
      message: `Crate ${crateId} assigned to order ${orderId}`,
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
 */
router.delete('/:crateId', async (req, res) => {
  const { crateId } = req.params;

  try {
    const deleted = await Crate.findOneAndDelete({ crateId });
    if (!deleted) return res.status(404).json({ error: 'Crate not found' });

    await logActivity({
      type: 'crate',
      message: `Crate ${crateId} was deleted`,
      status: 'error',
      relatedId: crateId
    });

    // ✅ Add notification
    const { createNotification } = require('../utils/notifications');

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
 */
router.patch('/:crateId/flag', async (req, res) => {
  const { crateId } = req.params;
  const { reason, description } = req.body;

  console.log(`🚩 Flag route hit for ${crateId}`);
  try {
    const crate = await Crate.findOne({ crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

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

    // ✅ Add notification
    const { createNotification } = require('../utils/notifications');

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
 */
router.patch('/:crateId/resolve', async (req, res) => {
  const { crateId } = req.params;

  try {
    const crate = await Crate.findOne({ crateId });
    if (!crate) return res.status(404).json({ error: 'Crate not found' });

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

    // ✅ Add notification
    const { createNotification } = require('../utils/notifications');

    await createNotification({
      type: 'crate',
      message,
      status: 'success',
      relatedId: crateId
    });

    res.json({ message: 'Crate resolved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error resolving crate flag.' });
  }
});

module.exports = router;
