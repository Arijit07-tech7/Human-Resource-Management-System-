const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  addCandidate,
  updateCandidateStage,
  getPipelineStats,
} = require('../controllers/recruitment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/pipeline', getPipelineStats);
router.post('/jobs', authorize('admin', 'hr'), createJob);
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJob);
router.put('/jobs/:id', authorize('admin', 'hr'), updateJob);
router.delete('/jobs/:id', authorize('admin', 'hr'), deleteJob);
router.post('/jobs/:id/candidates', authorize('admin', 'hr'), addCandidate);
router.put('/jobs/:jobId/candidates/:candidateId', authorize('admin', 'hr'), updateCandidateStage);

module.exports = router;
