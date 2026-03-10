const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  artwork_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  added_at: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at timestamp before saving
cartSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
