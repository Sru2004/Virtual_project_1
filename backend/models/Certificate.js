const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['bronze', 'silver', 'gold'],
    required: true
  },
  artwork_count: {
    type: Number,
    required: true,
    enum: [25, 50, 75] // Exactly match milestone counts
  },
  certificate_id: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  certificate_number: {
    type: String,
    required: true
  },
  description: {
    type: String,
    enum: [
      'Bronze Level Certificate - 25 Approved Artworks',
      'Silver Level Certificate - 50 Approved Artworks',
      'Gold Level Certificate - 75 Approved Artworks'
    ],
    required: true
  },
  pdf_path: {
    type: String,
    required: true
  },
  pdf_url: {
    type: String,
    required: true
  },
  issued_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  expires_at: {
    type: Date,
    default: null // Digital certificates don't expire unless explicitly set
  },
  is_revoked: {
    type: Boolean,
    default: false
  },
  revoked_reason: String,
  revoked_at: Date,
  metadata: {
    artist_name: String,
    artist_email: String,
    platform_name: {
      type: String,
      default: 'VisualArt'
    },
    signature_placeholder: {
      type: String,
      default: 'Digitally Signed'
    }
  },
  email_sent: {
    type: Boolean,
    default: false
  },
  email_sent_at: Date,
  download_count: {
    type: Number,
    default: 0
  },
  last_downloaded_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one certificate per level per artist
certificateSchema.index({ artist_id: 1, level: 1 }, { unique: true });

// Update timestamp on save
certificateSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
