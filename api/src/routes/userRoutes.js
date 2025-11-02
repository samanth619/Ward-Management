const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
} = require('../controllers/userController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const { 
  requireRole, 
  requirePermission, 
  requireSelfOrAdmin,
  ADMIN_ONLY 
} = require('../middleware/rbacMiddleware');
const {
  validateUserId,
  validateUserCreation,
  validateUserUpdate,
  validatePagination,
  validateSearch,
  sanitizeInput,
  validateUniqueEmail,
} = require('../middleware/validationMiddleware');

/**
 * User Management Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
router.get('/stats',
  ADMIN_ONLY,
  getUserStats
);

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin can see all, Staff can see ward users)
router.get('/',
  requirePermission('users:read'),
  validatePagination,
  validateSearch,
  getUsers
);

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/',
  requirePermission('users:create'),
  sanitizeInput,
  validateUserCreation,
  validateUniqueEmail,
  createUser
);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
router.get('/:id',
  validateUserId,
  requireSelfOrAdmin((req) => req.params.id),
  getUserById
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id',
  validateUserId,
  requirePermission('users:update'),
  sanitizeInput,
  validateUserUpdate,
  validateUniqueEmail,
  updateUser
);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id',
  validateUserId,
  requirePermission('users:delete'),
  deleteUser
);

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private (Admin only)
router.post('/:id/reset-password',
  validateUserId,
  requirePermission('users:update'),
  resetUserPassword
);

module.exports = router;