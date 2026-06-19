const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/** Get notifications for a user with pagination */
const listNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const skip = (page - 1) * limit;
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Notification.countDocuments(filter);
  return { notifications, total, page, limit };
};

/** Mark a notification as read */
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

/** Create a notification (internal use) */
const createNotification = async ({ user, type, title, message, metadata = {} }) => {
  const notification = new Notification({ user, type, title, message, metadata });
  await notification.save();
  return notification;
};

module.exports = {
  listNotifications,
  markAsRead,
  createNotification,
};
