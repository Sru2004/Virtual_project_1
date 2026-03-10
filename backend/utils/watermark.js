const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const escapeSvgText = (text = '') => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildTextSignatureSvg = ({ text, width, height, opacity, fontSize }) => {
  const safeText = escapeSvgText(text);
  return `
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="none" />
      <text
        x="50%"
        y="50%"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="rgba(255, 255, 255, ${opacity})"
        stroke="rgba(0, 0, 0, 0.35)"
        stroke-width="2"
        paint-order="stroke fill"
        text-anchor="middle"
        dominant-baseline="middle">
        ${safeText}
      </text>
    </svg>
  `;
};

const buildPlatformPatternSvg = ({ text, width, height, fontSize, opacity }) => {
  const safeText = escapeSvgText(text);
  const tileWidth = Math.max(180, Math.floor(width / 3));
  const tileHeight = Math.max(120, Math.floor(height / 3));
  return `
    <svg width="${width}" height="${height}">
      <defs>
        <pattern id="platform-pattern" x="0" y="0" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse">
          <text
            x="50%"
            y="50%"
            font-family="Arial, sans-serif"
            font-size="${fontSize}"
            fill="rgba(255, 255, 255, ${opacity})"
            text-anchor="middle"
            dominant-baseline="middle"
            transform="rotate(-45 ${tileWidth / 2} ${tileHeight / 2})">
            ${safeText}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#platform-pattern)" />
    </svg>
  `;
};

/**
 * Generate watermarked version of an image
 * @param {string} originalImagePath - Path to the original image
 * @param {string} artistName - Name of the artist to display in watermark
 * @returns {Promise<string>} - Path to the watermarked image
 */
async function generateWatermarkedImage(originalImagePath, artistName = 'Artist') {
  try {
    const parsedPath = path.parse(originalImagePath);
    const watermarkedFilename = `${parsedPath.name}-watermarked${parsedPath.ext}`;
    const watermarkedPath = path.join(parsedPath.dir, watermarkedFilename);
    
    // Get original image metadata
    const image = sharp(originalImagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    // Calculate watermark size (responsive based on image size)
    const watermarkFontSize = Math.max(Math.floor(width / 30), 20);
    const padding = Math.floor(width / 50);
    
    // Create watermark text SVG
    const watermarkText = `© ${artistName} - VisualArt`;
    const textWidth = watermarkText.length * (watermarkFontSize * 0.6);
    const textHeight = watermarkFontSize * 1.5;
    
    // Create semi-transparent watermark overlay
    const watermarkSvg = `
      <svg width="${textWidth + padding * 2}" height="${textHeight + padding * 2}">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.45)" rx="6"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${watermarkFontSize}" 
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.78)" 
          stroke="rgba(0, 0, 0, 0.45)"
          stroke-width="2"
          paint-order="stroke fill"
          text-anchor="middle" 
          dominant-baseline="middle"
          filter="url(#shadow)">
          ${watermarkText}
        </text>
      </svg>
    `;
    
    const watermarkBuffer = Buffer.from(watermarkSvg);
    
    // Calculate watermark position (bottom right with 5% margin)
    const marginX = Math.floor(width * 0.05);
    const marginY = Math.floor(height * 0.05);
    const watermarkX = width - textWidth - padding * 2 - marginX;
    const watermarkY = height - textHeight - padding * 2 - marginY;
    
    // Create diagonal watermark pattern for center (optional, more protection)
    const diagonalWatermarkSvg = `
      <svg width="${width}" height="${height}">
        <defs>
          <pattern id="watermark-pattern" x="0" y="0" width="${width / 3}" height="${height / 3}" patternUnits="userSpaceOnUse">
            <text 
              x="50%" 
              y="50%" 
              font-family="Arial, sans-serif" 
              font-size="${watermarkFontSize * 0.8}" 
              fill="rgba(255, 255, 255, 0.18)" 
              stroke="rgba(0, 0, 0, 0.2)"
              stroke-width="1"
              paint-order="stroke fill"
              text-anchor="middle" 
              dominant-baseline="middle"
              transform="rotate(-45 ${width / 6} ${height / 6})">
              ${watermarkText}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark-pattern)"/>
      </svg>
    `;
    
    const diagonalWatermarkBuffer = Buffer.from(diagonalWatermarkSvg);
    
    // Composite the watermarks onto the image
    await sharp(originalImagePath)
      .composite([
        {
          input: diagonalWatermarkBuffer,
          top: 0,
          left: 0,
          blend: 'over'
        },
        {
          input: watermarkBuffer,
          top: watermarkY,
          left: watermarkX,
          blend: 'over'
        }
      ])
      .toFile(watermarkedPath);
    
    console.log(`Watermarked image created: ${watermarkedPath}`);
    return watermarkedPath;
    
  } catch (error) {
    console.error('Error generating watermarked image:', error);
    throw error;
  }
}

/**
 * Generate a low-resolution preview with layered watermarks.
 * @param {object} options
 * @param {string} options.originalImagePath
 * @param {string} options.outputImagePath
 * @param {string} [options.signatureImagePath]
 * @param {string} [options.signatureText]
 * @param {string} [options.platformWatermarkText]
 * @param {boolean} [options.enablePlatformWatermark]
 * @param {number} [options.opacity]
 * @returns {Promise<string>}
 */
async function generateWatermarkedPreview({
  originalImagePath,
  outputImagePath,
  signatureImagePath,
  signatureText,
  platformWatermarkText = 'VisualArt',
  enablePlatformWatermark = false,
  opacity = 0.2
}) {
  try {
    const base = sharp(originalImagePath).rotate().resize({ width: 1200, withoutEnlargement: true });
    const { data, info } = await base.toBuffer({ resolveWithObject: true });

    const width = info.width || 1200;
    const height = info.height || 1200;

    const cornerSize = Math.max(48, Math.round(width * 0.08));
    const centerSize = Math.max(220, Math.round(width * 0.4));
    const cornerHeight = Math.round(cornerSize * 0.4);
    const centerHeight = Math.round(centerSize * 0.4);
    const margin = Math.max(16, Math.round(width * 0.03));

    const useSignatureImage = signatureImagePath && fsSync.existsSync(signatureImagePath);
    const fallbackText = signatureText || 'Artist';

    const buildSignatureBuffer = async (targetWidth, targetHeight, textOpacity) => {
      if (useSignatureImage) {
        return sharp(signatureImagePath)
          .resize({ width: targetWidth, height: targetHeight, fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer();
      }

      const fontSize = Math.max(18, Math.round(targetHeight * 0.8));
      const svg = buildTextSignatureSvg({
        text: fallbackText,
        width: targetWidth,
        height: targetHeight,
        opacity: textOpacity,
        fontSize
      });
      return Buffer.from(svg);
    };

    const cornerSignature = await buildSignatureBuffer(cornerSize, cornerHeight, opacity);
    const centerSignature = await buildSignatureBuffer(centerSize, centerHeight, Math.max(0.15, opacity - 0.05));

    const overlays = [
      {
        input: cornerSignature,
        top: margin,
        left: margin,
        blend: 'over',
        opacity
      },
      {
        input: cornerSignature,
        top: margin,
        left: width - cornerSize - margin,
        blend: 'over',
        opacity
      },
      {
        input: cornerSignature,
        top: height - cornerHeight - margin,
        left: margin,
        blend: 'over',
        opacity
      },
      {
        input: cornerSignature,
        top: height - cornerHeight - margin,
        left: width - cornerSize - margin,
        blend: 'over',
        opacity
      },
      {
        input: centerSignature,
        top: Math.max(0, Math.round(height / 2 - centerHeight / 2)),
        left: Math.max(0, Math.round(width / 2 - centerSize / 2)),
        blend: 'over',
        opacity: Math.max(0.15, opacity - 0.05)
      }
    ];

    if (enablePlatformWatermark && platformWatermarkText) {
      const patternSvg = buildPlatformPatternSvg({
        text: platformWatermarkText,
        width,
        height,
        fontSize: Math.max(18, Math.round(width * 0.04)),
        opacity: Math.max(0.1, opacity - 0.08)
      });
      overlays.unshift({
        input: Buffer.from(patternSvg),
        top: 0,
        left: 0,
        blend: 'over'
      });
    }

    await sharp(data)
      .composite(overlays)
      .jpeg({ quality: 72 })
      .toFile(outputImagePath);

    return outputImagePath;
  } catch (error) {
    console.error('Error generating watermarked preview:', error);
    throw error;
  }
}

/**
 * Create a low-resolution preview (for free previews)
 * @param {string} originalImagePath - Path to the original image
 * @returns {Promise<string>} - Path to the preview image
 */
async function generatePreviewImage(originalImagePath) {
  try {
    const parsedPath = path.parse(originalImagePath);
    const previewFilename = `${parsedPath.name}-preview${parsedPath.ext}`;
    const previewPath = path.join(parsedPath.dir, previewFilename);
    
    // Create a lower resolution version (max 800px width)
    await sharp(originalImagePath)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 70 }) // Reduce quality for preview
      .toFile(previewPath);
    
    console.log(`Preview image created: ${previewPath}`);
    return previewPath;
    
  } catch (error) {
    console.error('Error generating preview image:', error);
    throw error;
  }
}

/**
 * Delete image file safely
 * @param {string} imagePath - Path to the image to delete
 */
async function deleteImage(imagePath) {
  try {
    await fs.unlink(imagePath);
    console.log(`Deleted image: ${imagePath}`);
  } catch (error) {
    console.error(`Error deleting image ${imagePath}:`, error);
  }
}

/**
 * Get image dimensions
 * @param {string} imagePath - Path to the image
 * @returns {Promise<{width: number, height: number}>}
 */
async function getImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw error;
  }
}

module.exports = {
  generateWatermarkedImage,
  generateWatermarkedPreview,
  generatePreviewImage,
  deleteImage,
  getImageDimensions
};
