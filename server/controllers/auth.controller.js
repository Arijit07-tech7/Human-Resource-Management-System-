const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const generateEmployeeId = require('../utils/generateEmployeeld');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new employee
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, position, phone, salary } = req.body;

  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    throw new ApiError(400, 'Employee with this email already exists');
  }

  const employeeId = await generateEmployeeId();

  const employee = await Employee.create({
    employeeId,
    name,
    email,
    password,
    role,
    department,
    position,
    phone,
    salary,
  });

  const token = generateToken(employee._id);

  res.status(201).json(
    new ApiResponse(201, {
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        position: employee.position,
      },
      token,
    }, 'Employee registered successfully')
  );
});

// @desc    Login employee
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const employee = await Employee.findOne({ email }).select('+password');
  if (!employee) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await employee.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(employee._id);

  res.status(200).json(
    new ApiResponse(200, {
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        position: employee.position,
        avatar: employee.avatar,
      },
      token,
    }, 'Login successful')
  );
});

// @desc    Get current logged in employee profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, employee, 'Profile fetched successfully'));
});

module.exports = { register, login, getMe };