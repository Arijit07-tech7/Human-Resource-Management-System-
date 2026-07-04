const Employee = require('../models/Employee');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Get all employees
// @route   GET /api/v1/employees
const getAllEmployees = asyncHandler(async (req, res) => {
  const { department, status, role, search } = req.query;
  const parsedPage = parseInt(req.query.page, 10) || 1;
  const parsedLimit = parseInt(req.query.limit, 10) || 10;
  const query = {};

  if (department) query.department = department;
  if (status) query.status = status;
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  const employees = await Employee.find(query)
    .select('-password')
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit)
    .sort({ createdAt: -1 });

  const total = await Employee.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, { employees, total, page: parsedPage, pages: Math.ceil(total / parsedLimit) })
  );
});

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).select('-password');
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.status(200).json(new ApiResponse(200, employee));
});

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;
  const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.status(200).json(new ApiResponse(200, employee, 'Employee updated'));
});

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.status(200).json(new ApiResponse(200, null, 'Employee deleted'));
});

// @desc    Get leaderboard of top-performing employees
// @route   GET /api/v1/employees/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Employee.find({ status: 'active' })
    .select('name employeeId department position avatar performanceScore')
    .sort({ performanceScore: -1 })
    .limit(10);
  
  res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard fetched successfully'));
});

module.exports = { getAllEmployees, getEmployee, updateEmployee, deleteEmployee, getLeaderboard };
