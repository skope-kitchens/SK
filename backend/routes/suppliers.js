import express from 'express';
import Supplier from '../models/Supplier.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const suppliers = await Supplier.find(query).populate('products.ingredientId');
    
    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('products.ingredientId');
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/suppliers
// @desc    Create supplier
// @access  Private (Admin only)
router.post('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin only)
router.put('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
