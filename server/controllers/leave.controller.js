const Leave = require('../models/Leave');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Apply for leave
// @route   POST /api/v1/leaves
const applyLeave = asyncHandler(async (req, res) => {
  req.body.employee = req.user.id;
  const leave = await Leave.create(req.body);

  if (global.io) {
    global.io.emit('notification', {
      title: 'New Leave Request',
      message: `${req.user.name} applied for ${leave.leaveType} leave`,
      type: 'leave',
      timeAgo: 'Just now'
    });
  }

  res.status(201).json(new ApiResponse(201, leave, 'Leave applied successfully'));
});

// @desc    Get all leaves
// @route   GET /api/v1/leaves
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, employee, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (employee) query.employee = employee;
  if (req.user.role === 'employee') query.employee = req.user.id;

  const leaves = await Leave.find(query)
    .populate('employee', 'name employeeId department position avatar')
    .populate('approvedBy', 'name')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Leave.countDocuments(query);
  res.status(200).json(new ApiResponse(200, { leaves, total, page: parseInt(page) }));
});

// @desc    Update leave status
// @route   PUT /api/v1/leaves/:id
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new ApiError(404, 'Leave not found');
  leave.status = req.body.status;
  if (req.body.status === 'approved') leave.approvedBy = req.user.id;
  await leave.save();

  if (global.io) {
    global.io.emit('notification', {
      title: 'Leave Request Update',
      message: `Leave request status updated to ${req.body.status}`,
      type: 'leave',
      timeAgo: 'Just now'
    });
  }

  res.status(200).json(new ApiResponse(200, leave, 'Leave status updated'));
});

// @desc    Delete leave
// @route   DELETE /api/v1/leaves/:id
const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findByIdAndDelete(req.params.id);
  if (!leave) throw new ApiError(404, 'Leave not found');
  res.status(200).json(new ApiResponse(200, null, 'Leave deleted'));
});

module.exports = { applyLeave, getAllLeaves, updateLeaveStatus, deleteLeave };