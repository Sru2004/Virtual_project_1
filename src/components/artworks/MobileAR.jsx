import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { getImageUrl } from "../../lib/imageUtils";
import { toastSuccess, toastError } from "../../lib/toast";
import { useAuth } from "../../contexts/AuthContext";

/* ---------------- DEVICE CHECK ---------------- */

const isMobileDevice = () => {
  if (typeof window === "undefined") return false;

  const userAgent =
    navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent.toLowerCase());
};

/* ---------------- AR SUPPORT CHECK ---------------- */

const checkARSupport = async () => {
  try {
    if ("xr" in navigator) {
      return await navigator.xr.isSessionSupported("immersive-ar");
    }
    return false;
  } catch {
    return false;
  }
};

const MobileAR = () => {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [artwork, setArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const init = async () => {
      if (!isMobileDevice()) {
        setIsDesktop(true);
        setIsLoading(false);
        return;
      }

      await checkARSupport();

      try {
        // Use public endpoint for non-logged-in users
        const data = await api.getPublicArtwork(artworkId);
        setArtwork(data);
      } catch (err) {
        console.error(err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [artworkId]);

  /* ---------------- CAMERA ---------------- */

  const startCamera = async () => {
    try {
      setIsInitializing(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // important fix
        setCameraActive(true);
      }
    } catch {
      toastError("Camera permission denied");
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera(); // cleanup
  }, [stopCamera]);

  /* ---------------- DRAG ---------------- */

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    setPosition({
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  /* ---------------- SCREENSHOT ---------------- */

  const takeScreenshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);

    const link = document.createElement("a");
    link.download = "ar-preview.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();

    toastSuccess("Screenshot saved!");
  };

  /* ---------------- SHARE ---------------- */

  const sharePreview = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toastSuccess("Link copied!");
    } catch {
      toastError("Copy failed");
    }
  };

  /* ---------------- CART ---------------- */

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!profile?.user_type) {
      navigate('/login/user', {
        state: { from: location.pathname + location.search }
      });
      return;
    }
    try {
      const cart = JSON.parse(localStorage.getItem("cartItems") || "{}");
      cart[artwork._id] = (cart[artwork._id] || 0) + 1;
      localStorage.setItem("cartItems", JSON.stringify(cart));
      toastSuccess("Added to cart");
      navigate("/cart");
    } catch {
      toastError("Cart error");
    }
  };

  /* ---------------- STATES ---------------- */

  if (isDesktop)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            AR Preview works only on mobile
          </h2>
        </div>
      </div>
    );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );

  if (hasError || !artwork)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Failed to load artwork
      </div>
    );

  const artworkImageUrl = getImageUrl(
    artwork.watermarked_image_url || artwork.image_url
  );

  /* ---------------- UI ---------------- */

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {!cameraActive && !isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-green-600 text-white rounded-xl"
          >
            Start Camera
          </button>
        </div>
      )}

      {cameraActive && (
        <div
          className="absolute select-none"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={artworkImageUrl}
            alt={artwork.title}
            className="max-w-60 rounded-lg shadow-2xl"
            draggable={false}
          />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{artwork.title}</h3>
            <p>
              ₹
              {artwork.price
                ? Number(artwork.price).toLocaleString("en-IN")
                : "0"}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-green-600 rounded-lg"
          >
            Add to Cart
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setScale((s) => s + 0.1)}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            +
          </button>
          <button
            onClick={() => setScale((s) => s - 0.1)}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            -
          </button>
          <button
            onClick={() => setRotation((r) => r + 15)}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            Rotate
          </button>
          <button
            onClick={takeScreenshot}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            Screenshot
          </button>
          <button
            onClick={sharePreview}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAR;