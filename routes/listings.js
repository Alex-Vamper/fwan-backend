import express from 'express';
import Listing from '../models/Listing.js';
import Activity from '../models/Activity.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

// Helper to log activity
async function logActivity(activity) {
  try {
    await Activity.create(activity);
  } catch (err) {
    console.error('Activity logging failed:', err);
  }
}

/**
 * GET /api/listings
 * Fetch all listings
 */
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().lean();
    res.json({ listings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

/**
 * PATCH /api/listings/:listingId/flag
 * Flag a listing with reason and category
 */
router.patch('/:listingId/flag', async (req, res) => {
  const { listingId } = req.params;
  const { category, reason } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    listing.status = 'flagged';
    listing.flagCategory = category;
    listing.flagReason = reason;

    await listing.save();

    await logActivity({
      type: 'listing',
      message: `Listing ${listingId} flagged for ${category}`,
      status: 'warning',
      relatedId: listingId
    });

    await createNotification({
      type: 'listing',
      message: `Listing ${listingId} flagged: ${category} - ${reason}`,
      status: 'warning',
      relatedId: listingId
    });

    res.json({ message: 'Listing flagged successfully', listing });
  } catch (err) {
    console.error('Error flagging listing:', err);
    res.status(500).json({ error: 'Failed to flag listing' });
  }
});

/**
 * PATCH /api/listings/:listingId/delist
 * Delist a listing
 */
router.patch('/:listingId/delist', async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    listing.status = 'de-listed';
    await listing.save();

    await logActivity({
      type: 'listing',
      message: `Listing ${listingId} was de-listed`,
      status: 'error',
      relatedId: listingId
    });

    await createNotification({
      type: 'listing',
      message: `Listing ${listingId} was de-listed`,
      status: 'error',
      relatedId: listingId
    });

    res.json({ message: 'Listing de-listed successfully' });
  } catch (err) {
    console.error('Error de-listing listing:', err);
    res.status(500).json({ error: 'Failed to de-list listing' });
  }
});

/**
 * PATCH /api/listings/:listingId/resolve
 * Resolve flag on a listing
 */
router.patch('/:listingId/resolve', async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    listing.status = 'active';
    listing.flagCategory = null;
    listing.flagReason = null;

    await listing.save();

    await logActivity({
      type: 'listing',
      message: `Listing ${listingId} flag resolved`,
      status: 'success',
      relatedId: listingId
    });

    await createNotification({
      type: 'listing',
      message: `Listing ${listingId} flag resolved`,
      status: 'success',
      relatedId: listingId
    });

    res.json({ message: 'Listing flag resolved successfully' });
  } catch (err) {
    console.error('Error resolving listing flag:', err);
    res.status(500).json({ error: 'Failed to resolve flag' });
  }
});

export default router;
