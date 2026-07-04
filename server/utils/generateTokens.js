/**
 * Generate JWT access and refresh tokens
 */
const jwt = require('jsonwebtoken');

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  return { accessToken };
};

module.exports = generateTokens;
