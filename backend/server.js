const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());

// Block legacy private uploads if present
app.use('/uploads/private', (req, res) => {
  res.status(403).json({ message: 'Forbidden' });
});

// Serve uploads (public images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve certificates
app.use('/storage/certificates', express.static(path.join(__dirname, 'storage/certificates')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));



// Start HTTP server immediately, connect DB in background.
// This prevents the frontend from "hanging" when MongoDB is slow/unavailable.
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://srujanatoukare:Srujana123@cluster0.cp7lq.mongodb.net/virtual?appName=Cluster0';
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

const connectMongo = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30s for slow networks / Atlas cold start
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Fail fast instead of buffering when disconnected
    });
    const dbName = (mongoUri.includes('/') ? mongoUri.split('/').pop().split('?')[0] : '(unknown)') || '(unknown)';
    console.log(`✅ MongoDB connected successfully (db: ${dbName})`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔧 Troubleshooting: Check MONGODB_URI, Atlas Network Access (add 0.0.0.0/0), and credentials.');
  }
};

connectMongo();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/artist-profiles', require('./routes/artistProfiles'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/address', require('./routes/address'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/certificates', require('./routes/certificates'));

// Upload error handler
app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  const status = err.name === 'MulterError' ? 400 : 400;
  res.status(status).json({ message: err.message || 'Upload failed' });
});

// Health check
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const mongoState =
    state === 1 ? 'connected' :
    state === 2 ? 'connecting' :
    state === 3 ? 'disconnecting' :
    'disconnected';
  res.json({ status: 'OK', message: 'VisualArt Backend is running', mongo: mongoState });
});

module.exports = app;
