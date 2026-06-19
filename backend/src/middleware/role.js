const ApiError = require('../utils/ApiError');

// role middleware factory; accepts any number of roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User not authenticated'));
    }
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(new ApiError(403, 'Forbidden: insufficient role'));
    }
    next();
  };
};

module.exports = authorize;
