const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Check in
// @route   POST /api/v1/attendance/check-in
const checkIn = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  let attendance = await Attendance.findOne({ employee: req.user.id, date: { $gte: today, $lte: todayEnd } });
  if (attendance && attendance.checkIn) {
    throw new ApiError(400, 'Already checked in today');
  }

  attendance = await Attendance.create({
    employee: req.user.id,
    date: today,
    checkIn: now,
    status: now.getHours() > 9 ? 'late' : 'present',
  });

  if (global.io) {
    global.io.emit('notification', {
      title: 'Employee Check-in',
      message: `${req.user.name} checked in (${attendance.status})`,
      type: 'attendance',
      timeAgo: 'Just now'
    });
  }

  res.status(201).json(new ApiResponse(201, attendance, 'Checked in successfully'));
});

// @desc    Check out
// @route   PUT /api/v1/attendance/check-out
const checkOut = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const attendance = await Attendance.findOne({ employee: req.user.id, date: { $gte: today, $lte: todayEnd } });
  if (!attendance) throw new ApiError(400, 'Not checked in today');
  if (attendance.checkOut) throw new ApiError(400, 'Already checked out today');

  attendance.checkOut = now;
  await attendance.save();

  res.status(200).json(new ApiResponse(200, attendance, 'Checked out successfully'));
});

// @desc    Get attendance records
// @route   GET /api/v1/attendance
const getAttendance = asyncHandler(async (req, res) => {
  const { employee, startDate, endDate, status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (employee) query.employee = employee;
  if (req.user.role === 'employee') query.employee = req.user.id;
  if (status) query.status = status;
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const records = await Attendance.find(query)
    .populate('employee', 'name employeeId department')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);
  res.status(200).json(new ApiResponse(200, { records, total, page: parseInt(page) }));
});

module.exports = { checkIn, checkOut, getAttendance };