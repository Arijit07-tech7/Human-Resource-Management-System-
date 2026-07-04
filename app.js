const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./server/routes/index');
const { ApiError } = require('./server/utils/ApiResponse');
const errorHandler = require('./server/middleware/error.middleware');

const app = express();

// Security headers via helmet (optional)
try {
  const helmet = require('helmet');
  app.use(helmet({ contentSecurityPolicy: false }));
} catch (e) {
  console.warn('helmet not installed, skipping security headers');
}

// Rate limiting (optional)
try {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);
} catch (e) {
  console.warn('express-rate-limit not installed, skipping rate limiting');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// Serve index.html for all non-API routes (SPA support)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

module.exports = app;