const crypto = require('crypto');
const sharp = require('sharp');

/**
 * Generate SHA-256 hash from file buffer for exact duplicate detection
 * @param {Buffer} buffer - File buffer
 * @returns {string} - SHA-256 hash in hexadecimal format
 */
const generateSHA256Hash = (buffer) => {
  try {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (error) {
    console.error('Error generating SHA-256 hash:', error);
    throw new Error('Failed to generate image hash');
  }
};

/**
 * Generate a normalized SHA-256 hash from decoded pixel data.
 * This ensures identical images in different formats hash the same.
 * @param {Buffer} buffer - Image file buffer
 * @returns {Promise<string>} - SHA-256 hash of normalized pixels
 */
const generateNormalizedSHA256Hash = async (buffer) => {
  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .toColourspace('srgb')
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = crypto.createHash('sha256');
    hash.update(data);
    hash.update(String(info.width));
    hash.update(String(info.height));
    hash.update(String(info.channels));
    return hash.digest('hex');
  } catch (error) {
    console.error('Error generating normalized SHA-256 hash:', error);
    throw new Error('Failed to generate normalized image hash');
  }
};

/**
 * Generate perceptual hash (pHash) for similar image detection
 * Uses difference hash (dHash) algorithm - simpler but effective
 * @param {Buffer} buffer - Image file buffer
 * @returns {Promise<string>} - Perceptual hash as hexadecimal string
 */
const generatePerceptualHash = async (buffer) => {
  try {
    // Resize to 9x8 grayscale image
    const image = await sharp(buffer)
      .rotate()
      .resize(9, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    // Convert to array of pixel values
    const pixels = Array.from(image);

    // Calculate difference hash
    let hash = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const leftPixel = pixels[row * 9 + col];
        const rightPixel = pixels[row * 9 + col + 1];
        // Set bit to 1 if left pixel is brighter than right pixel
        hash += leftPixel > rightPixel ? '1' : '0';
      }
    }

    // Convert binary string to hexadecimal
    const hexHash = parseInt(hash, 2).toString(16).padStart(16, '0');
    return hexHash;
  } catch (error) {
    console.error('Error generating perceptual hash:', error);
    // Return null if perceptual hash fails (non-critical)
    return null;
  }
};

/**
 * Calculate Hamming distance between two perceptual hashes
 * @param {string} hash1 - First perceptual hash
 * @param {string} hash2 - Second perceptual hash
 * @returns {number} - Hamming distance (number of different bits)
 */
const calculateHammingDistance = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return -1;
  }

  try {
    // Convert hex to binary
    const bin1 = parseInt(hash1, 16).toString(2).padStart(64, '0');
    const bin2 = parseInt(hash2, 16).toString(2).padStart(64, '0');

    // Count different bits
    let distance = 0;
    for (let i = 0; i < bin1.length; i++) {
      if (bin1[i] !== bin2[i]) {
        distance++;
      }
    }
    return distance;
  } catch (error) {
    console.error('Error calculating Hamming distance:', error);
    return -1;
  }
};

/**
 * Calculate similarity score between two perceptual hashes (0..1)
 * @param {string} hash1 - First perceptual hash
 * @param {string} hash2 - Second perceptual hash
 * @returns {number} - Similarity ratio
 */
const calculateHashSimilarity = (hash1, hash2) => {
  const distance = calculateHammingDistance(hash1, hash2);
  if (distance === -1) return 0;
  const maxBits = 64;
  return (maxBits - distance) / maxBits;
};

/**
 * Check if two perceptual hashes are similar based on similarity ratio
 * @param {string} hash1 - First perceptual hash
 * @param {string} hash2 - Second perceptual hash
 * @param {number} minSimilarity - Minimum similarity ratio to consider similar (default: 0.9)
 * @returns {boolean} - True if images are similar
 */
const areSimilarImages = (hash1, hash2, minSimilarity = 0.9) => {
  return calculateHashSimilarity(hash1, hash2) >= minSimilarity;
};

module.exports = {
  generateSHA256Hash,
  generateNormalizedSHA256Hash,
  generatePerceptualHash,
  calculateHammingDistance,
  calculateHashSimilarity,
  areSimilarImages
};
