const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Hired.com', 'Referral', 'Indeed', 'Company Website', 'Other'],
    default: 'Other',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  stage: {
    type: String,
    enum: ['applied', 'phone-screen', 'interview', 'offer', 'hired', 'rejected'],
    default: 'applied',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  resume: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
  },
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: [String],
    location: {
      type: String,
      default: 'Remote',
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft', 'archived'],
      default: 'active',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    candidates: [candidateSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual for applicant count
jobSchema.virtual('applicantCount').get(function () {
  return this.candidates ? this.candidates.length : 0;
});

// Virtual for days left until deadline
jobSchema.virtual('daysLeft').get(function () {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diff = deadline - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
