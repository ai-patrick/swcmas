const ApiError = require('../utils/ApiError');

// wrapper for Joi validation schemas
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(400, `Validation error: ${message}`));
    }
    next();
  };
};

module.exports = validate;
