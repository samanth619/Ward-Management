const express = require("express");
const router = express.Router();

// Import controllers
const {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  getHouseholdStats,
  getHouseholdsByWard,
} = require("../controllers/householdController");

// Import middleware
const { protect } = require("../middleware/authMiddleware");
const { validatePagination } = require("../middleware/validationMiddleware");

/**
 * Household Management Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

// @desc    Get household statistics
// @route   GET /api/households/stats
// @access  Private
router.get("/stats", getHouseholdStats);

// @desc    Get households by ward
// @route   GET /api/households/by-ward/:wardId
// @access  Private
router.get("/by-ward/:wardId", validatePagination, getHouseholdsByWard);

// @desc    Get all households with pagination and filtering
// @route   GET /api/households
// @access  Private
router.get("/", validatePagination, getHouseholds);

// @desc    Get single household by ID
// @route   GET /api/households/:id
// @access  Private
router.get("/:id", getHouseholdById);

// @desc    Create new household
// @route   POST /api/households
// @access  Private
router.post("/", createHousehold);

// @desc    Update household
// @route   PUT /api/households/:id
// @access  Private
router.put("/:id", updateHousehold);

// @desc    Delete household
// @route   DELETE /api/households/:id
// @access  Private
router.delete("/:id", deleteHousehold);

module.exports = router;
