const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Simple audit logger middleware; attaches a helper to request
const audit = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user ? req.user._id : null;
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const oldValue = req.oldValue || null; // controllers can set this
      const newValue = req.newValue || null; // controllers can set this
      const logEntry = new AuditLog({
        user: userId,
        action,
        entity: req.params.entity || null,
        entityId: req.params.id || null,
        ipAddress: ip,
        oldValue,
        newValue,
        metadata: { method: req.method, path: req.originalUrl },
      });
      await logEntry.save();
      next();
    } catch (err) {
      logger.error('Audit logging failed: %s', err.message);
      next(); // don't block request on audit failure
    }
  };
};

module.exports = audit;
