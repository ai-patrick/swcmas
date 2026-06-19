const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const config = require('../config');

let storage;
if (config.cloudinary && config.cloudinary.cloudName) {
  // Use Cloudinary storage when credentials are provided
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'swcmas',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1280, height: 720, crop: 'limit' }],
    },
  });
} else {
  // Fallback to memory storage (useful for local dev / tests)
  storage = multer.memoryStorage();
}

const parser = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB limit

module.exports = parser;
