const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
} = require('../controllers/authController');

// Import middleware
const { protect, verifyRefreshToken, verifyEmailToken, verifyPasswordResetToken } = require('../middleware/authMiddleware');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateProfileUpdate,
  validateEmailVerification,
  validateRefreshToken,
  sanitizeInput,
  validateUniqueEmail,
} = require('../middleware/validationMiddleware');

/**
 * Authentication and User Management Routes
 */

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', 
  sanitizeInput,
  validateUserRegistration,
  validateUniqueEmail,
  register
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  sanitizeInput,
  validateUserLogin,
  login
);

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with valid refresh token)
router.post('/refresh', 
  validateRefreshToken,
  verifyRefreshToken,
  refreshToken
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', 
  protect,
  logout
);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', 
  protect,
  getProfile
);

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', 
  protect,
  sanitizeInput,
  validateProfileUpdate,
  updateProfile
);

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', 
  protect,
  validatePasswordChange,
  changePassword
);

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', 
  sanitizeInput,
  validatePasswordResetRequest,
  forgotPassword
);

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public (with valid reset token)
router.post('/reset-password', 
  validatePasswordReset,
  verifyPasswordResetToken,
  resetPassword
);

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public (with valid email verification token)
router.get('/verify-email/:token', 
  validateEmailVerification,
  verifyEmailToken,
  verifyEmail
);

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
router.post('/resend-verification', 
  protect,
  resendEmailVerification
);

module.exports = router;