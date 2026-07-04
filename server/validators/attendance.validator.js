/**
 * Validates request body for updating attendance records
 */
const updateAttendanceValidator = (req, res, next) => {
  const { status, checkIn, checkOut } = req.body;
  const validStatuses = ['present', 'absent', 'late', 'half-day', 'leave', 'Present', 'Absent', 'Half-Day', 'Leave'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  if (checkIn && isNaN(Date.parse(checkIn))) {
    return res.status(400).json({ success: false, message: 'Invalid checkIn date' });
  }

  if (checkOut && isNaN(Date.parse(checkOut))) {
    return res.status(400).json({ success: false, message: 'Invalid checkOut date' });
  }

  next();
};

module.exports = { updateAttendanceValidator };