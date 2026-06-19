const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');

// GET /notifications – list for current user
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const unreadOnly = req.query.unread === 'true';
    const result = await notificationService.listNotifications(req.user._id, { page, limit, unreadOnly });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/:id/read – mark as read
const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.user._id, req.params.id);
    res.json(new ApiResponse({ data: notification }));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, markRead };
