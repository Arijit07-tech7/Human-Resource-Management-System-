const express = require('express');
const router = express.Router();
const { applyLeave, getAllLeaves, updateLeaveStatus, deleteLeave } = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateLeaveApplication } = require('../validators/leave.validator');

router.use(protect);
router.post('/', validateLeaveApplication, applyLeave);
router.get('/', getAllLeaves);
router.put('/:id', authorize('admin', 'hr', 'manager'), updateLeaveStatus);
router.delete('/:id', deleteLeave);

module.exports = router;