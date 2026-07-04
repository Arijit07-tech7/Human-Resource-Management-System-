const ApiError = require('../utils/ApiError');

/**
 * Global Express error handling middleware.
 * Captures thrown ApiError objects, validation errors, and other server exceptions.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of custom ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = new ApiError(400, 'Duplicate field value entered');
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Resource not found with id of ${err.value}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  console.error('Error:', error.message);
  
  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
