/**
 * Error handling middleware for the Ward Management API
 */

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate field value entered';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: `${error.path} already exists`,
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign key constraint error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};