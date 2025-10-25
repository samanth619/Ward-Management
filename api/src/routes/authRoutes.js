const express = require('express');
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Register endpoint not implemented yet',
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Login endpoint not implemented yet',
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Logout endpoint not implemented yet',
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get profile endpoint not implemented yet',
  });
});

module.exports = router;