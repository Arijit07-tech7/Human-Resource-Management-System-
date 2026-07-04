/**
 * Format a date to a readable string (e.g., "Jul 4, 2026")
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get the difference in days between two dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get the relative time string (e.g., "2d ago", "5h ago")
 * @param {Date} date
 * @returns {string}
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
};

/**
 * Check if a date falls within the current month
 * @param {Date} date
 * @returns {boolean}
 */
const isCurrentMonth = (date) => {
  const now = new Date();
  const d = new Date(date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

/**
 * Get start and end of current month
 * @returns {{ startOfMonth: Date, endOfMonth: Date }}
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startOfMonth, endOfMonth };
};

module.exports = {
  formatDate,
  getDaysDifference,
  getRelativeTime,
  isCurrentMonth,
  getCurrentMonthRange,
};