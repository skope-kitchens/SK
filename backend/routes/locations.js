import express from 'express';
import Location from '../models/Location.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/locations
// @desc    Get all locations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/locations/:id
// @desc    Get single location
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/locations
// @desc    Create location
// @access  Private (Admin only)
router.post('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/locations/:id
// @desc    Update location
// @access  Private (Admin only)
router.put('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
