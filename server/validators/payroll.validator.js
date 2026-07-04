const mongoose = require('mongoose');

/**
 * Validates request body for creating a payroll record
 */
const createPayrollValidator = (req, res, next) => {
  const { employee, basicSalary, month, year } = req.body;

  if (!employee || !mongoose.Types.ObjectId.isValid(employee)) {
    return res.status(400).json({ success: false, message: 'Valid employee ID required' });
  }

  if (basicSalary === undefined || isNaN(parseFloat(basicSalary)) || parseFloat(basicSalary) < 0) {
    return res.status(400).json({ success: false, message: 'Valid basic salary required' });
  }

  const parsedMonth = parseInt(month, 10);
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ success: false, message: 'Month must be 1-12' });
  }

  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || parsedYear < 2000) {
    return res.status(400).json({ success: false, message: 'Valid year required' });
  }

  next();
};

/**
 * Validates request body for updating a payroll record
 */
const updatePayrollValidator = (req, res, next) => {
  const { basicSalary } = req.body;

  if (basicSalary !== undefined && (isNaN(parseFloat(basicSalary)) || parseFloat(basicSalary) < 0)) {
    return res.status(400).json({ success: false, message: 'Valid basic salary required' });
  }

  next();
};

module.exports = { createPayrollValidator, updatePayrollValidator };