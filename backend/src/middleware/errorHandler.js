const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err.isOperational || false;

  // log errors
  if (statusCode >= 500) {
    logger.error('Critical error: %s', err.stack);
  } else {
    logger.warn('Handled error: %s', err.message);
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (!isOperational && process.env.NODE_ENV !== 'development') {
    // hide details for unknown errors in production
    delete response.message;
    response.message = 'Something went wrong.';
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
