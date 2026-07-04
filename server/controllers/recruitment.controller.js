const Job = require('../models/Recruitment');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');

// @desc    Create a new job posting
// @route   POST /api/v1/recruitment/jobs
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create(req.body);
  res.status(201).json(new ApiResponse(201, job, 'Job posted successfully'));
});

// @desc    Get all jobs
// @route   GET /api/v1/recruitment/jobs
const getAllJobs = asyncHandler(async (req, res) => {
  const { status, department } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;

  const jobs = await Job.find(query).sort({ createdAt: -1 });
  const totalActive = await Job.countDocuments({ status: 'active' });
  const totalCandidates = jobs.reduce((sum, job) => sum + (job.candidates?.length || 0), 0);

  res.status(200).json(new ApiResponse(200, { jobs, totalActive, totalCandidates }));
});

// @desc    Get single job
// @route   GET /api/v1/recruitment/jobs/:id
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  res.status(200).json(new ApiResponse(200, job));
});

// @desc    Update job
// @route   PUT /api/v1/recruitment/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) throw new ApiError(404, 'Job not found');
  res.status(200).json(new ApiResponse(200, job, 'Job updated'));
});

// @desc    Delete job
// @route   DELETE /api/v1/recruitment/jobs/:id
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  res.status(200).json(new ApiResponse(200, null, 'Job deleted'));
});

// @desc    Add candidate to job
// @route   POST /api/v1/recruitment/jobs/:id/candidates
const addCandidate = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  job.candidates.push(req.body);
  await job.save();
  res.status(201).json(new ApiResponse(201, job, 'Candidate added'));
});

// @desc    Update candidate stage
// @route   PUT /api/v1/recruitment/jobs/:jobId/candidates/:candidateId
const updateCandidateStage = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const candidate = job.candidates.id(req.params.candidateId);
  if (!candidate) throw new ApiError(404, 'Candidate not found');

  Object.assign(candidate, req.body);
  await job.save();
  res.status(200).json(new ApiResponse(200, job, 'Candidate updated'));
});

// @desc    Get pipeline stats (candidates grouped by stage)
// @route   GET /api/v1/recruitment/pipeline
const getPipelineStats = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'active' });
  const pipeline = {
    applied: [],
    'phone-screen': [],
    interview: [],
    offer: [],
    hired: [],
  };

  jobs.forEach((job) => {
    job.candidates.forEach((candidate) => {
      if (pipeline[candidate.stage]) {
        pipeline[candidate.stage].push({
          ...candidate.toObject(),
          jobTitle: job.title,
          jobId: job._id,
        });
      }
    });
  });

  const stats = {
    totalPipelines: jobs.length,
    totalCandidates: jobs.reduce((sum, j) => sum + j.candidates.length, 0),
    newApplicants: pipeline.applied.length,
  };

  res.status(200).json(new ApiResponse(200, { pipeline, stats }));
});

module.exports = {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  addCandidate,
  updateCandidateStage,
  getPipelineStats,
};
