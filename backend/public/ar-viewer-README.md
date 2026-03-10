# AR Artwork Viewer

WebXR AR experience for placing artwork on walls. Uses watermarked images and includes protection measures.

## URL

```
/ar-viewer.html?img=<full_image_url>
```

Example:
```
/ar-viewer.html?img=https://yoursite.com/uploads/artwork-preview.jpg
```

## Features

- WebXR immersive-ar with hit-test and optional plane-detection
- Vertical plane (wall) detection for placement
- Tap to place, reposition, and scale controls
- Watermark baked into texture (use watermarked_image_url from backend)
- Protection: disabled right-click, context menu, Ctrl+S, Ctrl+U, Ctrl+Shift+I, PrintScreen
- Blur overlay when tab is inactive
- Copyright notice overlay
- Proper XR session cleanup on exit

## Requirements

- HTTPS (or localhost) for WebXR
- Mobile device with AR support (Chrome Android, Safari iOS 15+)
- Three.js loaded from CDN
