const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/ApiError');

/** Retrieve audit logs with optional filters and pagination */
const listAuditLogs = async ({ filter = {}, page = 1, limit = 50, sort = { timestamp: -1 } }) => {
  const skip = (page - 1) * limit;
  const logs = await AuditLog.find(filter)
    .populate('user', 'firstName lastName email role')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  const total = await AuditLog.countDocuments(filter);
  return { logs, total, page, limit };
};

module.exports = { listAuditLogs };
