const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Job = require('../models/Recruitment');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalEmployees = await Employee.countDocuments({ status: 'active' });
  const totalDepartments = await Employee.distinct('department').then((d) => d.length);
  const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
  const activeJobs = await Job.countDocuments({ status: 'active' });

  // Today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const presentToday = await Attendance.countDocuments({
    date: { $gte: today, $lte: todayEnd },
    status: 'present',
  });

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // Monthly payroll
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyPayroll = await Payroll.aggregate([
    { $match: { month: currentMonth, year: currentYear } },
    { $group: { _id: null, total: { $sum: '$netSalary' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      activeJobs,
      presentToday,
      attendanceRate,
      monthlyPayroll: monthlyPayroll[0]?.total || 0,
    })
  );
});

module.exports = { getDashboardStats };
