const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid', 'other'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);