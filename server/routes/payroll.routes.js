const express = require('express');
const router = express.Router();
const { createPayroll, getAllPayroll, updatePayroll } = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createPayrollValidator, updatePayrollValidator } = require('../validators/payroll.validator');

router.use(protect);
router.post('/', authorize('admin', 'hr'), createPayrollValidator, createPayroll);
router.get('/', getAllPayroll);
router.put('/:id', authorize('admin', 'hr'), updatePayrollValidator, updatePayroll);

module.exports = router;
