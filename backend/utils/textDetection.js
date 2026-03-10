const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

let workerPromise;

const KEYWORDS = [
  'watermark',
  'copyright',
  'all rights reserved',
  'visualart',
  '©',
  'registered',
  'trademark'
];

const normalizeText = (text = '') => text.toLowerCase().replace(/\s+/g, ' ').trim();

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      return worker;
    })();
  }
  return workerPromise;
};

const getWordBox = (word) => {
  if (!word) return null;
  if (word.bbox) {
    const { x0, y0, x1, y1 } = word.bbox;
    return { x0, y0, x1, y1 };
  }
  if (typeof word.x0 === 'number') {
    return { x0: word.x0, y0: word.y0, x1: word.x1, y1: word.y1 };
  }
  return null;
};

const detectWatermarkedText = async (buffer, options = {}) => {
  const {
    minConfidence = 60,
    textAreaRatioThreshold = 0.015,
    cornerRatioThreshold = 0.12
  } = options;

  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .grayscale()
    .toBuffer({ resolveWithObject: true });

  const worker = await getWorker();
  const result = await worker.recognize(data);
  const text = normalizeText(result.data?.text || '');
  const words = result.data?.words || [];

  const width = info.width || 1;
  const height = info.height || 1;
  const imageArea = width * height;

  let textArea = 0;
  let cornerTextDetected = false;

  for (const word of words) {
    const confidence = Number(word.confidence || 0);
    if (confidence < minConfidence) {
      continue;
    }

    const box = getWordBox(word);
    if (!box) {
      continue;
    }

    const area = Math.max(0, box.x1 - box.x0) * Math.max(0, box.y1 - box.y0);
    textArea += area;

    const isCorner =
      (box.x0 < width * cornerRatioThreshold && box.y0 < height * cornerRatioThreshold) ||
      (box.x1 > width * (1 - cornerRatioThreshold) && box.y0 < height * cornerRatioThreshold) ||
      (box.x0 < width * cornerRatioThreshold && box.y1 > height * (1 - cornerRatioThreshold)) ||
      (box.x1 > width * (1 - cornerRatioThreshold) && box.y1 > height * (1 - cornerRatioThreshold));

    if (isCorner && (word.text || '').length >= 3) {
      cornerTextDetected = true;
    }
  }

  const textAreaRatio = imageArea > 0 ? textArea / imageArea : 0;
  const hasKeyword = KEYWORDS.some((keyword) => text.includes(keyword));
  const hasLargeTextOverlay = textAreaRatio >= textAreaRatioThreshold;

  return {
    text,
    textAreaRatio,
    hasKeyword,
    hasLargeTextOverlay,
    cornerTextDetected
  };
};

module.exports = {
  detectWatermarkedText
};
