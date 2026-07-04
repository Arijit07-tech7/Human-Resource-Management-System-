/**
 * Leave validator
 */
const validateLeaveApplication = (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: 'All leave fields are required' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
  }
  next();
};

module.exports = { validateLeaveApplication };