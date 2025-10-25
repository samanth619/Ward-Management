const express = require('express');
const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get users endpoint not implemented yet',
  });
});

module.exports = router;