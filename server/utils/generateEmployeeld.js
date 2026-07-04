const Employee = require('../models/Employee');

/**
 * Generates a unique employee ID in format: EMP-0001, EMP-0002, etc.
 * @returns {Promise<string>} The generated employee ID
 */
const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });

  if (!lastEmployee || !lastEmployee.employeeId) {
    return 'EMP-0001';
  }

  const lastIdNum = parseInt(lastEmployee.employeeId.split('-')[1]);
  const newIdNum = lastIdNum + 1;
  return `EMP-${String(newIdNum).padStart(4, '0')}`;
};

module.exports = generateEmployeeId;