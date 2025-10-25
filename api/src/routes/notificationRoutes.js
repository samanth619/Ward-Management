const express = require('express');
const router = express.Router();

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get notifications endpoint not implemented yet',
  });
});

module.exports = router;