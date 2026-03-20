import express from 'express';
import Ingredient from '../models/Ingredient.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/ingredients
// @desc    Get all ingredients
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    const ingredients = await Ingredient.find(query).populate('supplier');
    
    res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ingredients/:id
// @desc    Get single ingredient
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate('supplier')
      .populate('priceHistory.supplierId');
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ingredients
// @desc    Create ingredient
// @access  Private
router.post('/', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/ingredients/:id
// @desc    Update ingredient
// @access  Private
router.put('/:id', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    // If price is changing, add to price history
    if (req.body.currentPrice && req.body.currentPrice !== ingredient.currentPrice) {
      ingredient.priceHistory.push({
        price: ingredient.currentPrice,
        date: new Date(),
        supplierId: ingredient.supplier
      });
    }
    
    Object.assign(ingredient, req.body);
    await ingredient.save();

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/ingredients/:id/price
// @desc    Update ingredient price
// @access  Private
router.put('/:id/price', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const { newPrice, supplierId } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    // Add current price to history
    ingredient.priceHistory.push({
      price: ingredient.currentPrice,
      date: new Date(),
      supplierId: ingredient.supplier
    });
    
    ingredient.currentPrice = newPrice;
    if (supplierId) ingredient.supplier = supplierId;
    await ingredient.save();

    res.json({
      success: true,
      data: ingredient,
      message: 'Price updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
