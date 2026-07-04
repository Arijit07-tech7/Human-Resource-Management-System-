const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'manager', 'employee'],
      default: 'employee',
    },
    department: {
      type: String,
      enum: ['engineering', 'design', 'marketing', 'sales', 'hr', 'finance', 'operations', 'support'],
      required: [true, 'Department is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated'],
      default: 'active',
    },
    salary: {
      type: Number,
      default: 0,
    },
    performanceScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);