const express = require('express');
const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get events endpoint not implemented yet',
  });
});

module.exports = router;