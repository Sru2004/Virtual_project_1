const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artwork_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtistProfile',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
reviewSchema.index({ user_id: 1, artwork_id: 1 }, { unique: true });
reviewSchema.index({ artwork_id: 1, created_at: -1 });
reviewSchema.index({ artist_id: 1, created_at: -1 });

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
