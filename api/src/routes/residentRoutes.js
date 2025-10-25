const express = require('express');
const router = express.Router();

// @desc    Get all residents
// @route   GET /api/residents
// @access  Private
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get residents endpoint not implemented yet',
  });
});

// @desc    Get single resident
// @route   GET /api/residents/:id
// @access  Private
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get resident endpoint not implemented yet',
  });
});

// @desc    Create new resident
// @route   POST /api/residents
// @access  Private
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Create resident endpoint not implemented yet',
  });
});

// @desc    Update resident
// @route   PUT /api/residents/:id
// @access  Private
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update resident endpoint not implemented yet',
  });
});

// @desc    Delete resident
// @route   DELETE /api/residents/:id
// @access  Private
router.delete('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Delete resident endpoint not implemented yet',
  });
});

module.exports = router;