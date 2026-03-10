const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'delivered'],
    default: 'pending'
  },
  payment_type: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  delivery_status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  },
  shipping_address: {
    type: String,
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
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

module.exports = mongoose.model('Order', orderSchema);
