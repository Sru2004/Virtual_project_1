const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Artwork = require('../models/Artwork');
const ArtistProfile = require('../models/ArtistProfile');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper function to calculate and update artwork ratings
 */
const updateArtworkRating = async (artworkId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { artwork_id: artworkId } },
      {
        $group: {
          _id: '$artwork_id',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Artwork.findByIdAndUpdate(artworkId, {
        avg_rating: Math.round(stats[0].avgRating * 10) / 10,
        total_reviews: stats[0].totalReviews
      });
    } else {
      await Artwork.findByIdAndUpdate(artworkId, {
        avg_rating: 0,
        total_reviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating artwork rating:', error);
  }
};

/**
 * Helper function to calculate and update artist ratings
 */
const updateArtistRating = async (artistId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { artist_id: artistId } },
      {
        $group: {
          _id: '$artist_id',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await ArtistProfile.findByIdAndUpdate(artistId, {
        avg_rating: Math.round(stats[0].avgRating * 10) / 10,
        total_reviews: stats[0].totalReviews
      });
    } else {
      await ArtistProfile.findByIdAndUpdate(artistId, {
        avg_rating: 0,
        total_reviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating artist rating:', error);
  }
};

// Get reviews for artist
router.get('/artist', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'artist') {
      return res.status(403).json({ success: false, message: 'Access denied. Artist only.' });
    }

    const artistProfile = await ArtistProfile.findOne({ user_id: req.user._id });
    const artistIds = [req.user._id];
    if (artistProfile) {
      artistIds.push(artistProfile._id);
    }

    const reviews = await Review.find({
      artist_id: { $in: artistIds }
    })
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title image_url')
      .sort({ created_at: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('[REVIEWS API] Error fetching artist reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reviews
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.user_type === 'artist') {
      const artistProfile = await ArtistProfile.findOne({ user_id: req.user._id });
      if (artistProfile) {
        query.artist_id = artistProfile._id;
      } else {
        return res.json({ success: true, reviews: [] });
      }
    } else if (req.user.user_type !== 'admin') {
      query.user_id = req.user._id;
    }

    const reviews = await Review.find(query)
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title image_url')
      .populate('artist_id', 'artist_name')
      .sort({ created_at: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews for an artwork
router.get('/artwork/:artworkId', async (req, res) => {
  try {
    const reviews = await Review.find({ artwork_id: req.params.artworkId })
      .populate('user_id', 'full_name')
      .populate('artist_id', 'artist_name')
      .sort({ created_at: -1 });
    
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingBreakdown[review.rating]++;
    });

    res.json({
      success: true,
      reviews,
      ratingBreakdown,
      avgRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for an artist
router.get('/artist-profile/:artistId', async (req, res) => {
  try {
    const reviews = await Review.find({ artist_id: req.params.artistId })
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title image_url')
      .sort({ created_at: -1 });

    const artist = await ArtistProfile.findById(req.params.artistId);
    
    res.json({
      success: true,
      reviews,
      avgRating: artist?.avg_rating || 0,
      totalReviews: artist?.total_reviews || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get review by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title')
      .populate('artist_id', 'artist_name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review
router.post('/', auth, [
  body('artwork_id').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { artwork_id, rating, comment } = req.body;

    const artwork = await Artwork.findById(artwork_id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Find any order for this artwork by this user
    const order = await Order.findOne({
      user_id: req.user._id,
      artwork_id
    });

    // Check if review is allowed
    let canReview = false;
    
    if (order) {
      const deliveryStatus = String(order.delivery_status || '').toLowerCase();
      const status = String(order.status || '').toLowerCase();
      const orderTime = order.created_at ? new Date(order.created_at).getTime() : (order.order_date ? new Date(order.order_date).getTime() : 0);
      const now = Date.now();
      
      // Allow if delivered or completed
      if (deliveryStatus === 'delivered' || status === 'completed' || status === 'delivered') {
        canReview = true;
      }
      // Allow if order exists and 5 minutes have passed
      else if (orderTime > 0) {
        const minutesPassed = (now - orderTime) / (1000 * 60);
        if (minutesPassed >= 5) {
          canReview = true;
        }
      }
      // Allow if order exists (no time check needed)
      else {
        canReview = true;
      }
    }

    // Allow admins to review without purchase
    if (!canReview && req.user.user_type !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You can only review artworks after delivery or 5 minutes after placing order.',
        requiresPurchase: true
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user_id: req.user._id,
      artwork_id
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this artwork. You can update your existing review.' 
      });
    }

    const review = new Review({
      user_id: req.user._id,
      artwork_id,
      artist_id: artwork.artist_id,
      order_id: order ? order._id : null,
      rating,
      comment
    });

    await review.save();
    await review.populate('user_id', 'full_name');
    await review.populate('artwork_id', 'title');
    await review.populate('artist_id', 'artist_name');

    // Update artwork and artist ratings
    await updateArtworkRating(artwork_id);
    await updateArtistRating(artwork.artist_id);

    res.status(201).json({ 
      success: true, 
      message: 'Review created successfully', 
      review 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update review
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldRating = review.rating;
    const artworkId = review.artwork_id;
    const artistId = review.artist_id;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    )
      .populate('user_id', 'full_name')
      .populate('artwork_id', 'title')
      .populate('artist_id', 'artist_name');

    if (req.body.rating && req.body.rating !== oldRating) {
      await updateArtworkRating(artworkId);
      await updateArtistRating(artistId);
    }

    res.json({ success: true, review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const artworkId = review.artwork_id;
    const artistId = review.artist_id;

    await Review.findByIdAndDelete(req.params.id);

    await updateArtworkRating(artworkId);
    await updateArtistRating(artistId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
