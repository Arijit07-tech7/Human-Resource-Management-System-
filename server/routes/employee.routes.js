const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployee, updateEmployee, deleteEmployee, getLeaderboard } = require('../controllers/employee.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateEmployeeUpdate } = require('../validators/employee.validator');

router.use(protect);
router.get('/', getAllEmployees);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getEmployee);
router.put('/:id', authorize('admin', 'hr'), validateEmployeeUpdate, updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;