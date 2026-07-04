/**
 * Employee validator
 */
const validateEmployeeUpdate = (req, res, next) => {
  const { email } = req.body;
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }
  next();
};

module.exports = { validateEmployeeUpdate };
