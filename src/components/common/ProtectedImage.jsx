import React, { useState, useEffect } from 'react';

/**
 * Protected Image Component with security features
 * - Disables right-click context menu
 * - Disables image dragging
 * - Adds transparent overlay to prevent save
 * - Optional watermark notice
 */
const ProtectedImage = ({ 
  src, 
  alt, 
  className = '',
  showProtectionNotice = false,
  overlayText = '',
  onError,
  style = {}
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Disable right-click on the entire document when component is mounted
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag start on images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Disable keyboard shortcuts (Ctrl+S, Ctrl+Shift+I, F12)
    const handleKeyDown = (e) => {
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block w-full h-full select-none" style={{ userSelect: 'none', ...style }}>
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className={className}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onError={onError}
        onLoad={() => setImageLoaded(true)}
        draggable="false"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      {/* Transparent Overlay - Prevents direct image access */}
      <div 
        className="absolute inset-0 bg-transparent cursor-default"
        style={{ 
          userSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onDragStart={(e) => {
          e.preventDefault();
          return false;
        }}
      />

      {/* Optional dynamic watermark overlay */}
      {overlayText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/20 text-lg md:text-2xl font-semibold uppercase tracking-wide transform -rotate-12">
            {overlayText}
          </div>
        </div>
      )}
      
      {/* Optional Protection Notice */}
      {showProtectionNotice && imageLoaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Protected
          </span>
        </div>
      )}
    </div>
  );
};

export default ProtectedImage;
