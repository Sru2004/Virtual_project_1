# Virtual Art Gallery - Deployment Guide

## Overview

This is a MERN stack application (MongoDB, Express, React, Node.js) with AR features for an art marketplace.

## Architecture

- **Frontend**: React + Vite (on Vercel)
- **Backend**: Express.js API (deploy on Render/Railway/Heroku)
- **Database**: MongoDB (Atlas)

---

## Deployment Steps

### Option 1: Separate Deployment (Recommended)

#### Part 1: Deploy Backend on Render/Railway

1. **Push code to GitHub** (if not already done)

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy to Render**:
   - Go to https://render.com and connect your GitHub
   - Create a new "Web Service"
   - Select your repository
   - Configure:
     - Build Command: `npm install`
     - Start Command: `node backend/server.js`
   - Add Environment Variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: 5000
     - `JWT_SECRET`: Generate a secure random string
   - Deploy

3. **Get your backend URL**: e.g., `https://your-app.onrender.com`

#### Part 2: Deploy Frontend on Vercel

1. **Set Environment Variable**:
   In Vercel project settings, add:
   - Variable Name: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://your-app.onrender.com`)

2. **Deploy**:
   - Connect your GitHub repo to Vercel
   - Vercel will auto-detect the settings from vercel.json
   - Deploy

2: Verc---

### Option el API Routes (Advanced)

Convert Express routes to Vercel serverless functions (requires significant refactoring).

---

## Environment Variables Needed

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000  (development)
VITE_API_URL=https://your-backend-url.com (production)
```

### Backend (.env)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## CORS Configuration

Update backend/server.js to allow your Vercel domain:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-frontend.vercel.app", // Add your Vercel URL
  ],
  credentials: true,
  // ... rest of config
};
```

---

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Check that VITE_API_URL is set correctly in Vercel
   - Ensure backend is running and accessible

2. **MongoDB Connection Issues**
   - Verify MONGODB_URI in backend environment
   - Check MongoDB Atlas Network Access (allow 0.0.0.0/0)

3. **Build Errors**
   - Clear Vercel cache and redeploy
   - Check that all dependencies are in package.json

4. **CORS Errors**
   - Add your Vercel domain to backend CORS configuration

---

## Quick Fix Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```
