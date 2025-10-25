const express = require('express');
const router = express.Router();

// @desc    Get all households
// @route   GET /api/households
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get households endpoint not implemented yet',
  });
});

module.exports = router;