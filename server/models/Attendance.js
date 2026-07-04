const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      default: 'present',
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut - this.checkIn;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);