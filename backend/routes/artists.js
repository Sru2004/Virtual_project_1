const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

const PUBLISHED_STATUSES = ['published', 'sold'];

/**
 * Construct full image URL if needed
 * Handles both local paths and absolute URLs
 */
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Local path - will be resolved by frontend with API_URL
  return imagePath;
};

/**
 * Shared handler: list artists that have an ArtistProfile (one per user, no duplicates).
 */
const listArtistsWithProfiles = async () => {
  const profiles = await ArtistProfile.find({}).lean();
  const validProfiles = profiles.filter((p) => {
    const uid = p && p.user_id;
    return uid && mongoose.Types.ObjectId.isValid(uid);
  });
  const uniqueUserIds = [...new Set(validProfiles.map((p) => String(p.user_id)))];
  if (uniqueUserIds.length === 0) {
    return [];
  }
  const artistUserObjectIds = uniqueUserIds.map((id) => new mongoose.Types.ObjectId(id));

  const artists = await User.find({
    _id: { $in: artistUserObjectIds },
    user_type: 'artist',
  })
    .select('-password')
    .lean();

  const artistIds = (artists || []).map((a) => a._id);
  const profileByUserId = new Map(
    validProfiles.map((p) => [String(p.user_id), p])
  );
  const artistProfileIds = validProfiles.map((p) => p._id).filter(Boolean);
  const artworkArtistIds = [...artistIds, ...artistProfileIds];

  const artistIdToUserId = new Map();
  artistIds.forEach((id) => artistIdToUserId.set(String(id), String(id)));
  validProfiles.forEach((p) => {
    if (p._id && p.user_id) {
      artistIdToUserId.set(String(p._id), String(p.user_id));
    }
  });

  let countByUserId = new Map();
  if (artworkArtistIds.length > 0) {
    const artworkCounts = await Artwork.aggregate([
      { $match: { artist_id: { $in: artworkArtistIds }, status: { $in: PUBLISHED_STATUSES } } },
      { $group: { _id: '$artist_id', count: { $sum: 1 } } },
    ]);
    artworkCounts.forEach((entry) => {
      const userId = artistIdToUserId.get(String(entry._id));
      if (userId) {
        countByUserId.set(userId, (countByUserId.get(userId) || 0) + entry.count);
      }
    });
  }

  const payload = artists.map((artist) => {
    const profile = profileByUserId.get(String(artist._id));
    return {
      id: artist._id,
      full_name: artist.full_name,
      profile_picture: buildImageUrl(artist.profile_picture),
      artist_name: (profile && profile.artist_name) || artist.full_name,
      bio: (profile && profile.bio) || '',
      artworks_count: countByUserId.get(String(artist._id)) || 0,
    };
  });

  return Array.from(new Map(payload.map((a) => [String(a.id), a])).values());
};

// GET /api/artist/dashboard-stats - Get dashboard statistics for logged-in artist
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    // Verify user is an artist
    if (req.user.user_type !== 'artist') {
      return res.status(403).json({ message: 'Access denied. Artist only.' });
    }

    // Get artist profile
    const artistProfile = await ArtistProfile.findOne({ user_id: req.user._id });
    const artistIds = [req.user._id];
    if (artistProfile) {
      artistIds.push(artistProfile._id);
    }

    // Count total uploads (artworks)
    const totalUploads = await Artwork.countDocuments({ 
      artist_id: { $in: artistIds } 
    });

    // Get all artworks for this artist
    const artworks = await Artwork.find({ 
      artist_id: { $in: artistIds } 
    }).select('_id');
    
    const artworkIds = artworks.map(art => art._id);

    // Count completed orders (sales) for artist's artworks
    const sales = await Order.countDocuments({
      artwork_id: { $in: artworkIds },
      status: 'completed'
    });

    // Count total orders for artist's artworks
    const orders = await Order.countDocuments({
      artwork_id: { $in: artworkIds }
    });

    // Calculate average rating from reviews
    const reviewStats = await Review.aggregate([
      {
        $match: {
          artist_id: { $in: artistIds }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0;

    res.json({
      success: true,
      stats: {
        totalUploads,
        sales,
        avgRating: Number(avgRating.toFixed(1)),
        orders
      }
    });
  } catch (error) {
    console.error('[ARTISTS API] Error fetching dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Public list for "Meet Our Artists" (no login required)
router.get('/public', async (req, res) => {
  try {
    const list = await listArtistsWithProfiles();
    console.log(`[ARTISTS API] Public list: ${list.length} unique artists`);
    res.json(list);
  } catch (error) {
    console.error('[ARTISTS API] Error fetching public artists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Authenticated list (same data, requires auth)
router.get('/', auth, async (req, res) => {
  try {
    const list = await listArtistsWithProfiles();
    console.log(`[ARTISTS API] Returning ${list.length} unique artists`);
    res.json(list);
  } catch (error) {
    console.error('[ARTISTS API] Error fetching artists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Normalize Mongoose Map or object to plain object for JSON
const toPlainSocialLinks = (social_links) => {
  if (!social_links) return {};
  if (typeof social_links.toObject === 'function') return social_links.toObject();
  if (social_links instanceof Map) return Object.fromEntries(social_links);
  return typeof social_links === 'object' ? social_links : {};
};

router.get('/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    if (!paramId || !mongoose.Types.ObjectId.isValid(paramId)) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    let artist = await User.findById(paramId).select('-password');
    let profile = null;

    if (artist && artist.user_type === 'artist') {
      profile = await ArtistProfile.findOne({ user_id: artist._id }).lean();
    } else {
      // Try as ArtistProfile id (e.g. link from list that used profile id)
      const profileDoc = await ArtistProfile.findById(paramId).lean();
      if (profileDoc && profileDoc.user_id) {
        profile = profileDoc;
        artist = await User.findById(profileDoc.user_id).select('-password');
        if (!artist || artist.user_type !== 'artist') {
          return res.status(404).json({ message: 'Artist not found' });
        }
      }
    }

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artistIds = [artist._id];
    if (profile && profile._id) {
      artistIds.push(profile._id);
    }

    const artworks = await Artwork.find({
      artist_id: { $in: artistIds },
      status: { $in: PUBLISHED_STATUSES }
    }).sort({ created_at: -1 }).lean();

    const processedArtworks = artworks.map(artwork => ({
      ...artwork,
      image_url: buildImageUrl(artwork.image_url)
    }));

    const socialLinks = toPlainSocialLinks(profile?.social_links);

    res.json({
      artist: {
        id: artist._id,
        full_name: artist.full_name,
        email: profile?.email || artist.email || '',
        phone: profile?.phone || artist.phone || '',
        profile_picture: buildImageUrl(artist.profile_picture),
        artist_name: profile?.artist_name || artist.full_name,
        bio: profile?.bio || '',
        portfolio_link: profile?.portfolio_link || '',
        art_style: profile?.art_style || '',
        location: profile?.location || '',
        social_links: socialLinks,
        years_experience: profile?.years_experience ?? 0,
        exhibitions: profile?.exhibitions ?? 0,
        awards_won: profile?.awards_won ?? 0,
        artworks_sold: profile?.artworks_sold ?? 0,
        artworks_count: processedArtworks.length
      },
      artworks: processedArtworks
    });
  } catch (error) {
    console.error('[ARTISTS API] Error fetching artist:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
