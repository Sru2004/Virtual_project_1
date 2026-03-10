const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createUploader = (destDir, options = {}) => {
  const { allowedMimes = imageMimes, maxSize = 5 * 1024 * 1024, errorMessage = 'Only image files are allowed.' } = options;
  ensureDir(destDir);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').slice(0, 40);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
      cb(null, unique);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessage), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize }
  });
};

const uploadsRoot = path.join(__dirname, '../uploads');
const storageRoot = path.join(__dirname, '../storage');

const profileUpload = createUploader(path.join(uploadsRoot, 'profiles'), {
  maxSize: 5 * 1024 * 1024,
  errorMessage: 'Invalid image type. Only jpg, jpeg, png, webp, gif allowed.'
});
const artworkUpload = createUploader(path.join(storageRoot, 'originals'), {
  maxSize: 5 * 1024 * 1024,
  errorMessage: 'Invalid image type. Only jpg, jpeg, png, webp allowed.'
});
const signatureUpload = createUploader(path.join(storageRoot, 'signatures'), {
  allowedMimes: ['image/png'],
  maxSize: 2 * 1024 * 1024,
  errorMessage: 'Signature must be a PNG with transparent background.'
});

const upload = profileUpload;
upload.profileUpload = profileUpload;
upload.artworkUpload = artworkUpload;
upload.signatureUpload = signatureUpload;

module.exports = upload;
