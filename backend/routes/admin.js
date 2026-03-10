const express = require('express');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');
const { checkAndGenerateCertificate } = require('../controllers/certificateController');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const buildMonthlySeries = async ({ model, dateField, match = {}, sumField }) => {
  const pipeline = [
    { $match: match },
    { $addFields: { resolvedDate: { $ifNull: [`$${dateField}`, '$created_at'] } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$resolvedDate'
          }
        },
        total: {
          $sum: sumField ? { $ifNull: [`$${sumField}`, 0] } : 1
        }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const results = await model.aggregate(pipeline);
  return results.map((row) => ({ month: row._id, total: row.total }));
};

// Get all users (admin only)
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalArtists, totalArtworks, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ user_type: 'artist' }),
      Artwork.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$total_amount', 0] } } } }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalArtists,
      totalArtworks,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user-growth', auth, requireAdmin, async (req, res) => {
  try {
    const series = await buildMonthlySeries({
      model: User,
      dateField: 'created_at'
    });

    res.json(series.map((row) => ({ month: row.month, users: row.total })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sales-trend', auth, requireAdmin, async (req, res) => {
  try {
    const series = await buildMonthlySeries({
      model: Order,
      dateField: 'order_date',
      match: { status: 'completed' },
      sumField: 'total_amount'
    });

    res.json(series.map((row) => ({ month: row.month, revenue: row.total })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artwork-status', auth, requireAdmin, async (req, res) => {
  try {
    const statusAgg = await Artwork.aggregate([
      { $group: { _id: '$approval_status', count: { $sum: 1 } } }
    ]);

    const statusMap = statusAgg.reduce((acc, row) => {
      acc[row._id || 'pending'] = row.count;
      return acc;
    }, {});

    res.json({
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      rejected: statusMap.rejected || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all artworks (admin only)
router.get('/artworks', auth, requireAdmin, async (req, res) => {
  try {
    const artworks = await Artwork.find().populate('artist_id', 'full_name');
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/orders', auth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'full_name email')
      .populate('artwork_id', 'title price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews (admin only)
router.get('/reviews', auth, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/artworks/:artworkId/approve
 * @desc    Approve an artwork (triggers certificate check)
 * @access  Admin
 */
router.post('/artworks/:artworkId/approve', auth, requireAdmin, async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Update artwork status to published and approval_status to approved
    artwork.status = 'published';
    artwork.approval_status = 'approved';
    await artwork.save();

    // Check if artist has reached a milestone for certificate generation
    let certificateGenerated = null;
    try {
      certificateGenerated = await checkAndGenerateCertificate(artwork.artist_id);
      if (certificateGenerated) {
        console.log(`Certificate generated for artist: ${artwork.artist_id}`);
      }
    } catch (certError) {
      console.error('Error checking certificate milestone:', certError);
      // Continue even if certificate generation fails
    }

    res.json({
      success: true,
      message: 'Artwork approved successfully',
      artwork,
      certificateGenerated: certificateGenerated ? true : false,
      certificateInfo: certificateGenerated || null
    });
  } catch (error) {
    console.error('Error approving artwork:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/admin/artworks/:artworkId/reject
 * @desc    Reject an artwork
 * @access  Admin
 */
router.post('/artworks/:artworkId/reject', auth, requireAdmin, async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { reason } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Update artwork
    artwork.status = 'rejected';
    artwork.approval_status = 'rejected';
    artwork.rejected_reason = reason || 'No reason provided';
    artwork.rejected_by = req.user.id;
    await artwork.save();

    res.json({
      success: true,
      message: 'Artwork rejected successfully',
      artwork
    });
  } catch (error) {
    console.error('Error rejecting artwork:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/artworks/pending
 * @desc    Get all pending artworks (awaiting approval)
 * @access  Admin
 */
router.get('/artworks/pending', auth, requireAdmin, async (req, res) => {
  try {
    const pendingArtworks = await Artwork.find({
      approval_status: 'pending'
    })
      .populate('artist_id', 'full_name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: pendingArtworks.length,
      artworks: pendingArtworks
    });
  } catch (error) {
    console.error('Error fetching pending artworks:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
