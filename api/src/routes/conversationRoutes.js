const express = require('express');
const router = express.Router();

// @desc    Get all conversations
// @route   GET /api/conversations
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get conversations endpoint not implemented yet',
  });
});

module.exports = router;