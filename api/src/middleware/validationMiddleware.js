const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware for authentication and user management
 */

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  
  next();
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ min: 5, max: 255 })
  .withMessage('Email must be between 5 and 255 characters');

const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const phoneValidation = body('phone')
  .optional()
  .matches(/^[+]?[\d\s-()]+$/)
  .withMessage('Please provide a valid phone number')
  .isLength({ min: 10, max: 15 })
  .withMessage('Phone number must be between 10 and 15 characters');

const roleValidation = body('role')
  .optional()
  .isIn(['admin', 'staff', 'read_only'])
  .withMessage('Role must be admin, staff, or read_only');

const wardSecretariatIdValidation = body('ward_secretariat_id')
  .optional()
  .isUUID()
  .withMessage('Ward secretariat ID must be a valid UUID');

// User registration validation
const validateUserRegistration = [
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValidation,
  roleValidation,
  wardSecretariatIdValidation,
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password cannot be empty'),
  handleValidationErrors,
];

// Password reset request validation
const validatePasswordResetRequest = [
  emailValidation,
  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  passwordValidation,
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors,
];

// Change password validation
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  passwordValidation.custom((value, { req }) => {
    if (value === req.body.current_password) {
      throw new Error('New password must be different from current password');
    }
    return true;
  }),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  nameValidation.optional(),
  phoneValidation,
  body('ward_secretariat_id')
    .optional()
    .isUUID()
    .withMessage('Ward secretariat ID must be a valid UUID'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be a valid object'),
  handleValidationErrors,
];

// Email verification validation
const validateEmailVerification = [
  param('token')
    .notEmpty()
    .withMessage('Email verification token is required')
    .isJWT()
    .withMessage('Invalid token format'),
  handleValidationErrors,
];

// Refresh token validation
const validateRefreshToken = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid refresh token format'),
  handleValidationErrors,
];

// User ID parameter validation
const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  handleValidationErrors,
];

// User creation by admin validation
const validateUserCreation = [
  nameValidation,
  emailValidation,
  body('password')
    .optional()
    .custom((value, { req }) => {
      // If password is provided, validate it
      if (value) {
        return passwordValidation._run(req, 'password', {});
      }
      return true;
    }),
  phoneValidation,
  roleValidation,
  wardSecretariatIdValidation,
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  body('send_invitation')
    .optional()
    .isBoolean()
    .withMessage('send_invitation must be a boolean value'),
  handleValidationErrors,
];

// User update validation
const validateUserUpdate = [
  nameValidation.optional(),
  phoneValidation,
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'read_only'])
    .withMessage('Role must be admin, staff, or read_only'),
  wardSecretariatIdValidation,
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be a valid object'),
  handleValidationErrors,
];

// Pagination validation (for users)
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['name', 'email', 'role', 'created_at', 'last_login'])
    .withMessage('Sort field must be name, email, role, created_at, or last_login'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors,
];

// Pagination validation for residents
const validateResidentPagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['first_name', 'last_name', 'middle_name', 'date_of_birth', 'gender', 'occupation', 'caste', 'created_at', 'updated_at', 'resident_id'])
    .withMessage('Sort field must be first_name, last_name, middle_name, date_of_birth, gender, occupation, caste, created_at, updated_at, or resident_id'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors,
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
  query('role')
    .optional()
    .isIn(['admin', 'staff', 'read_only'])
    .withMessage('Role filter must be admin, staff, or read_only'),
  query('ward_secretariat_id')
    .optional()
    .isUUID()
    .withMessage('Ward secretariat ID must be a valid UUID'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active filter must be a boolean value'),
  handleValidationErrors,
];

// File upload validation
const validateFileUpload = [
  body('file_type')
    .optional()
    .isIn(['image', 'document'])
    .withMessage('File type must be image or document'),
  handleValidationErrors,
];

// Custom validation for unique email
const validateUniqueEmail = async (req, res, next) => {
  try {
    const { getModels } = require('../models');
    const models = await getModels();
    
    if (!models || !models.User) {
      console.error('User model not available');
      return res.status(500).json({
        success: false,
        message: 'Internal server error: User model not available',
      });
    }

    const { email } = req.body;
    const userId = req.params.id;

    if (email) {
      const existingUser = await models.User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{
            field: 'email',
            message: 'Email address is already in use',
            value: email,
          }],
        });
      }
    }

    next();
  } catch (error) {
    console.error('Email validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during email validation',
    });
  }
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Trim string fields
  const stringFields = ['name', 'email', 'phone'];
  stringFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  });

  // Convert email to lowercase
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase();
  }

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateProfileUpdate,
  validateEmailVerification,
  validateRefreshToken,
  validateUserId,
  validateUserCreation,
  validateUserUpdate,
  validatePagination,
  validateResidentPagination,
  validateSearch,
  validateFileUpload,
  validateUniqueEmail,
  sanitizeInput,
  handleValidationErrors,
};