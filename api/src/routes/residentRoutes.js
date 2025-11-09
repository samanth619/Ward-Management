const express = require('express');
const router = express.Router();

// Import controllers
const {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  getResidentStats,
  getResidentDemographics,
  getUpcomingBirthdays,
  getUpcomingAnniversaries,
} = require('../controllers/residentController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const { validateResidentPagination } = require('../middleware/validationMiddleware');

/**
 * Resident Management Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

// @desc    Get resident statistics
// @route   GET /api/residents/stats
// @access  Private
router.get('/stats', getResidentStats);

// @desc    Get resident demographics
// @route   GET /api/residents/demographics
// @access  Private
router.get('/demographics', getResidentDemographics);

// @desc    Get upcoming birthdays
// @route   GET /api/residents/birthdays/upcoming
// @access  Private
router.get('/birthdays/upcoming', getUpcomingBirthdays);

// @desc    Get upcoming anniversaries
// @route   GET /api/residents/anniversaries/upcoming
// @access  Private
router.get('/anniversaries/upcoming', getUpcomingAnniversaries);

// @desc    Get all residents with pagination and filtering
// @route   GET /api/residents
// @access  Private
router.get('/', validateResidentPagination, getResidents);

// @desc    Get single resident by ID
// @route   GET /api/residents/:id
// @access  Private
router.get('/:id', getResidentById);

// @desc    Create new resident
// @route   POST /api/residents
// @access  Private
router.post('/', createResident);

// @desc    Update resident
// @route   PUT /api/residents/:id
// @access  Private
router.put('/:id', updateResident);

// @desc    Delete resident
// @route   DELETE /api/residents/:id
// @access  Private
router.delete('/:id', deleteResident);

module.exports = router;