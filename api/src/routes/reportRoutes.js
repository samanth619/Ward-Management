const express = require('express');
const router = express.Router();

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get reports endpoint not implemented yet',
  });
});

module.exports = router;