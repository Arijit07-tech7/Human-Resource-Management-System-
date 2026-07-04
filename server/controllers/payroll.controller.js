const Payroll = require('../models/Payroll');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Create payroll record
// @route   POST /api/v1/payroll
const createPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.create(req.body);
  res.status(201).json(new ApiResponse(201, payroll, 'Payroll created'));
});

// @desc    Get all payroll records
// @route   GET /api/v1/payroll
const getAllPayroll = asyncHandler(async (req, res) => {
  const { month, year, status, employee, page = 1, limit = 10 } = req.query;
  const query = {};
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;
  if (employee) query.employee = employee;

  const records = await Payroll.find(query)
    .populate('employee', 'name employeeId department position')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Payroll.countDocuments(query);
  res.status(200).json(new ApiResponse(200, { records, total, page: parseInt(page) }));
});

// @desc    Update payroll status
// @route   PUT /api/v1/payroll/:id
const updatePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('employee', 'name');
  if (!payroll) throw new ApiError(404, 'Payroll record not found');

  if (global.io) {
    global.io.emit('notification', {
      title: 'Payroll Updated',
      message: `Payroll processed for ${payroll.employee?.name || 'employee'} (${payroll.status.toUpperCase()})`,
      type: 'payroll',
      timeAgo: 'Just now'
    });
  }

  res.status(200).json(new ApiResponse(200, payroll, 'Payroll updated'));
});

module.exports = { createPayroll, getAllPayroll, updatePayroll };