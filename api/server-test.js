const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Ward Management API is running (without database)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    name: 'Ward Management System API',
    version: '1.0.0',
    description: 'Backend API for Municipal Ward People Management Platform',
    status: 'Development - Database not connected',
    endpoints: {
      auth: '/api/auth (not implemented)',
      residents: '/api/residents (not implemented)',
      households: '/api/households (not implemented)',
      conversations: '/api/conversations (not implemented)',
      events: '/api/events (not implemented)',
      notifications: '/api/notifications (not implemented)',
      reports: '/api/reports (not implemented)',
      users: '/api/users (not implemented)',
      health: '/api/health',
    },
  });
});

// Test endpoint to verify server functionality
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working correctly!',
    timestamp: new Date().toISOString(),
    info: 'This is a test endpoint to verify the server setup is working.',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ward Management API Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📝 Note: Database connection disabled for initial testing');
});

module.exports = app;