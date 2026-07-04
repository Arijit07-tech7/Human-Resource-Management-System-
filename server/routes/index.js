const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const dashboardRoutes = require('./dashboard.routes');
const leaveRoutes = require('./leave.routes');
const attendanceRoutes = require('./attendance.routes');
const payrollRoutes = require('./payroll.routes');
const notificationRoutes = require('./notification.routes');
const recruitmentRoutes = require('./recruitment.routes');

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payroll', payrollRoutes);
router.use('/notifications', notificationRoutes);
router.use('/recruitment', recruitmentRoutes);

module.exports = router;