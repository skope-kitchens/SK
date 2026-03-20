import express from 'express';
import Client from '../models/Client.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { status, pricingTier } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (pricingTier) query.pricingTier = pricingTier;
    
    const clients = await Client.find(query).populate('recurringOrders.recipeId');
    
    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('recurringOrders.recipeId');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/clients
// @desc    Register new B2B client
// @access  Public
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({
      success: true,
      data: client,
      message: 'Client registration submitted. Awaiting approval.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private (Admin only)
router.put('/:id', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/clients/:id/approve
// @desc    Approve client
// @access  Private (Admin only)
router.put('/:id/approve', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 'ACTIVE' },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client approved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
