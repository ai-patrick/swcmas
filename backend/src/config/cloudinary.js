const cloudinary = require('cloudinary').v2;
const config = require('./index');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    logger.info('Cloudinary connected successfully');
    return result;
  } catch (error) {
    logger.error(`Cloudinary connection failed: ${error.message}`);
  }
};

if (config.env !== 'test' && config.cloudinary && config.cloudinary.cloudName) {
  testConnection();
}

module.exports = cloudinary;