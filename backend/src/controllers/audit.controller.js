const auditService = require('../services/audit.service');
const ApiResponse = require('../utils/ApiResponse');

// GET /audit – list logs (admin only)
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.action) filter.action = req.query.action;
    const result = await auditService.listAuditLogs({ filter, page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll };
