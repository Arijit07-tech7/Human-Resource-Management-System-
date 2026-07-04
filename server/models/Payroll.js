const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    totalAllowances: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
    },
    paidDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
payrollSchema.pre('save', function (next) {
  this.totalAllowances =
    (this.allowances.hra || 0) +
    (this.allowances.transport || 0) +
    (this.allowances.medical || 0) +
    (this.allowances.other || 0);

  this.totalDeductions =
    (this.deductions.tax || 0) +
    (this.deductions.insurance || 0) +
    (this.deductions.providentFund || 0) +
    (this.deductions.other || 0);

  this.netSalary = this.basicSalary + this.totalAllowances - this.totalDeductions;
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);