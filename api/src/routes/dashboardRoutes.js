const express = require("express");
const router = express.Router();

// Import controllers
const { getDashboard } = require("../controllers/dashboardController");

// Import middleware
const { protect } = require("../middleware/authMiddleware");

/**
 * Dashboard Routes
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

// @desc    Get dashboard data (aggregated)
// @route   GET /api/dashboard
// @access  Private
router.get("/", getDashboard);

module.exports = router;

