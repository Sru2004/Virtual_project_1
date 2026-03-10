const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Artwork = require('../models/Artwork');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user._id })
      .populate('items.artwork_id', 'title price image_url category artist_id');
    
    if (!cart) {
      // Return empty cart if none exists
      return res.json({ success: true, cart: { items: [] } });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[CART API] Error fetching cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to cart
router.post('/add', auth, [
  body('artworkId').isMongoId().withMessage('Invalid artwork ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { artworkId } = req.body;

    // Validate artwork exists and is published
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    if (artwork.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Artwork not available for purchase' });
    }

    // Check if user is trying to add their own artwork
    if (artwork.artist_id && artwork.artist_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot add your own artwork to cart' });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user_id: req.user._id,
        items: [{ artwork_id: artworkId, quantity: 1 }]
      });
    } else {
      // Check if artwork already in cart
      const existingItem = cart.items.find(
        item => item.artwork_id.toString() === artworkId
      );

      if (existingItem) {
        return res.status(400).json({ 
          success: false, 
          message: 'Artwork already in cart' 
        });
      }

      // Add new item to cart
      cart.items.push({ artwork_id: artworkId, quantity: 1 });
    }

    await cart.save();
    
    // Populate artwork details
    await cart.populate('items.artwork_id', 'title price image_url category artist_id');

    res.status(200).json({ 
      success: true, 
      message: 'Added to cart successfully',
      cart 
    });
  } catch (error) {
    console.error('[CART API] Error adding to cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from cart
router.delete('/remove/:artworkId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.artwork_id.toString() !== req.params.artworkId
    );

    await cart.save();

    res.json({ success: true, message: 'Removed from cart', cart });
  } catch (error) {
    console.error('[CART API] Error removing from cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:artworkId', auth, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { quantity } = req.body;
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find and update item
    const item = cart.items.find(
      item => item.artwork_id.toString() === req.params.artworkId
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error('[CART API] Error updating cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    console.error('[CART API] Error clearing cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
