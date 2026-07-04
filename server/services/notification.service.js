const Notification = require('../models/Notification');

/**
 * Notification service to trigger app alerts
 */
const createSystemNotification = async ({ title, message, type, recipientId, senderId }) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      recipient: recipientId,
      sender: senderId
    });
    console.log(`🔔 System notification triggered: ${title}`);
    return notification;
  } catch (error) {
    console.error('Error generating notification:', error.message);
  }
};

module.exports = { createSystemNotification };
