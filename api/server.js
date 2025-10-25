const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import configurations
const { sequelize } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const residentRoutes = require('./src/routes/residentRoutes');
const householdRoutes = require('./src/routes/householdRoutes');
const conversationRoutes = require('./src/routes/conversationRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const userRoutes = require('./src/routes/userRoutes');

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
    message: 'Ward Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    name: 'Ward Management System API',
    version: '1.0.0',
    description: 'Backend API for Municipal Ward People Management Platform',
    endpoints: {
      auth: '/api/auth',
      residents: '/api/residents',
      households: '/api/households',
      conversations: '/api/conversations',
      events: '/api/events',
      notifications: '/api/notifications',
      reports: '/api/reports',
      users: '/api/users',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Sync database models (be careful in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized successfully.');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Ward Management API Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;