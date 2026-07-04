const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT access token from Authorization header or cookie.
 * Attaches the authenticated employee to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized, no token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Employee.findById(decoded.id).select('-password');
        if (!user) throw new ApiError(401, 'User no longer exists');
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, 'Not authorized, token invalid or expired');
    }
});

/**
 * Role-based authorization middleware.
 * Usage: authorize('Admin') or authorize('Admin', 'Employee')
 */
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(
            new ApiError(403, `Role '${req.user.role}' is not allowed to access this resource`)
        );
    }
    next();
};

module.exports = { protect, authorize };