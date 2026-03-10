import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';
import { X, ArrowLeft, ShoppingCart, Star, User, AlertCircle } from 'lucide-react';
import { toastSuccess, toastError } from '../../lib/toast';
import { useAuth } from '../../contexts/AuthContext';

const WebcamAR = () => {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const videoRef = useRef(null);
  const [artwork, setArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Artwork positioning
  const [position, setPosition] = useState({ x: 50, y: 30 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setIsLoading(true);
        // Use public endpoint for non-logged-in users
        const artworkData = await api.getPublicArtwork(artworkId);
        setArtwork(artworkData);
      } catch (error) {
        console.error('Error fetching artwork:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (artworkId) {
      fetchArtwork();
    }

    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [artworkId]);

  useEffect(() => {
    // Handle visibility change to restart camera
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cameraActive) {
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setCameraError('Unable to access webcam. Please check your camera permissions.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleBack = () => {
    stopCamera();
    navigate(`/ar-preview/${artworkId}`);
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!profile?.user_type) {
      navigate('/login/user', {
        state: { from: location.pathname + location.search }
      });
      return;
    }
    try {
      const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      const newQuantity = (currentCart[artwork._id] || 0) + 1;
      currentCart[artwork._id] = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
      toastSuccess(`Added "${artwork.title}" to cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toastError('Failed to add item to cart. Please try again.');
    }
  };

  const getArtworkDimensions = () => {
    if (!artwork) return { width: 24, height: 18, unit: 'inches' };
    return {
      width: artwork.width || 24,
      height: artwork.height || 18,
      unit: artwork.dimension_unit || 'inches'
    };
  };

  const artworkImageUrl = artwork 
    ? getImageUrl(artwork.watermarked_image_url || artwork.watermarkedImage || artwork.image_url) 
    : 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (hasError || !artwork) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-2xl p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">Failed to load artwork</p>
          <button
            onClick={() => navigate('/artworks')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Browse Artworks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-20 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Device Selection
      </button>

      {/* Camera Toggle */}
      {!cameraActive && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Camera
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Stop Camera
          </button>
        </div>
      )}

      {/* Webcam Feed with Artwork Overlay */}
      <div 
        className="w-full h-screen relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Artwork Overlay */}
        {cameraActive && (
          <div
            className="absolute cursor-move select-none"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
            onMouseDown={handleMouseDown}
          >
            <img
              src={artworkImageUrl}
              alt={artwork.title}
              className="max-w-md md:max-w-lg lg:max-w-xl shadow-2xl rounded-lg"
              draggable={false}
            />
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center p-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-xl mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {cameraActive && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg">
            <p className="text-center">Drag the artwork to position it • Use buttons below to resize</p>
          </div>
        )}
      </div>

      {/* Controls and Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6">
        <div className="max-w-6xl mx-auto">
          {/* Scale Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              - Smaller
            </button>
            <span className="px-4 py-2 bg-white/10 text-white rounded-lg">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              + Larger
            </button>
          </div>

          {/* Artwork Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{artwork.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                {artwork.artist_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{artwork.artist_id.artist_name || 'Artist'}</span>
                  </div>
                )}
                {artwork.avg_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{artwork.avg_rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-purple-400 font-bold text-xl">
                  ₹{Number(artwork.price).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Change Device
              </button>
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamAR;
