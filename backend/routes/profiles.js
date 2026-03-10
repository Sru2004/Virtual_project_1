const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all profiles (public)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/:id', auth, upload.single('profile_picture'), [
  body('full_name').optional().notEmpty(),
  body('phone').optional(),
  body('address').optional(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('dateOfBirth').optional().isISO8601(),
  body('city').optional(),
  body('state').optional(),
  body('country').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user can update this profile
    if (req.user._id.toString() !== req.params.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    updates.updated_at = new Date();

    // If a new profile picture was uploaded, use the path
    if (req.file) {
      updates.profile_picture = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload signature (PNG only)
router.post('/:id/signature', auth, upload.signatureUpload.single('signature'), async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Signature file is required (PNG with transparent background).' });
    }

    if (req.file.mimetype !== 'image/png') {
      return res.status(400).json({ message: 'Signature must be a PNG with transparent background.' });
    }

    const signaturePath = `storage/signatures/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { signatureImage: signaturePath, updated_at: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Signature uploaded successfully', signatureImage: user.signatureImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete profile
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete profiles
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
