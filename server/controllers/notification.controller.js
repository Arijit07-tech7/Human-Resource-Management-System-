const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Get notifications for current user
// @route   GET /api/v1/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
  res.status(200).json(new ApiResponse(200, { notifications, unreadCount }));
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  res.status(200).json(new ApiResponse(200, notification, 'Marked as read'));
});

// @desc    Mark all as read
// @route   PUT /api/v1/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
