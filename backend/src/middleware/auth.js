const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Verify access token and attach user to request
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication token missing or invalid'));
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }
    req.user = user; // attach full user document
    next();
  } catch (err) {
    logger.error('Auth middleware error: %s', err.message);
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token expired'));
    }
    next(new ApiError(401, 'Invalid authentication token'));
  }
};

module.exports = protect;
