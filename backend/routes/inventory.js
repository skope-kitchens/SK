import express from 'express';
import InventoryStock from '../models/InventoryStock.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Ingredient from '../models/Ingredient.js';
import Alert from '../models/Alert.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get inventory stock for a location
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { locationId, status, category } = req.query;
    
    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }
    
    let query = { locationId };
    if (status) query.status = status;
    
    const inventory = await InventoryStock.find(query)
      .populate({
        path: 'ingredientId',
        match: category ? { category } : {},
        populate: { path: 'supplier' }
      })
      .populate('locationId');
    
    // Filter out null ingredients (from category filter)
    const filteredInventory = inventory.filter(item => item.ingredientId);
    
    res.json({
      success: true,
      count: filteredInventory.length,
      data: filteredInventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/inventory/alerts
// @desc    Get low stock alerts
// @access  Private
router.get('/alerts', protect, async (req, res) => {
  try {
    const { locationId } = req.query;
    let query = { status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'] } };
    
    if (locationId) query.locationId = locationId;
    
    const alerts = await InventoryStock.find(query)
      .populate('ingredientId')
      .populate('locationId');
    
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/inventory/transactions
// @desc    Get inventory transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const { locationId, ingredientId, transactionType, startDate, endDate } = req.query;
    let query = {};
    
    if (locationId) query.locationId = locationId;
    if (ingredientId) query.ingredientId = ingredientId;
    if (transactionType) query.transactionType = transactionType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await InventoryTransaction.find(query)
      .populate('ingredientId')
      .populate('locationId')
      .populate('performedBy')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/inventory/restock
// @desc    Add stock (purchase)
// @access  Private
router.post('/restock', protect, authorize('SUPER_ADMIN', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const { locationId, ingredientId, quantity, unitCost, supplierId, batchNumber, expiryDate } = req.body;
    
    let stock = await InventoryStock.findOne({ locationId, ingredientId });
    
    const previousStock = stock ? stock.currentStock : 0;
    const newStock = previousStock + quantity;
    
    if (stock) {
      stock.currentStock = newStock;
      stock.lastRestocked = new Date();
      if (expiryDate) stock.expiryDate = expiryDate;
      if (batchNumber) stock.batchNumber = batchNumber;
      
      // Update average cost
      if (unitCost && stock.averageCost) {
        const totalValue = (stock.currentStock * stock.averageCost) + (quantity * unitCost);
        stock.averageCost = totalValue / newStock;
      } else if (unitCost) {
        stock.averageCost = unitCost;
      }
      
      await stock.save();
    } else {
      // Create new stock record
      const ingredient = await Ingredient.findById(ingredientId);
      stock = await InventoryStock.create({
        locationId,
        ingredientId,
        currentStock: quantity,
        uom: ingredient?.baseUOM,
        reorderLevel: ingredient?.reorderLevel,
        reorderQuantity: ingredient?.reorderQuantity,
        averageCost: unitCost,
        lastRestocked: new Date(),
        expiryDate,
        batchNumber
      });
    }
    
    // Create transaction
    await InventoryTransaction.create({
      locationId,
      ingredientId,
      transactionType: 'PURCHASE',
      quantity,
      unitCost,
      currentStock: previousStock,
      newStock,
      supplierId,
      batchNumber,
      expiryDate,
      performedBy: req.user.id
    });
    
    await stock.populate('ingredientId locationId');

    res.json({
      success: true,
      data: stock,
      message: 'Inventory restocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/inventory/waste
// @desc    Log waste
// @access  Private
router.post('/waste', protect, async (req, res) => {
  try {
    const { locationId, ingredientId, quantity, reason, notes } = req.body;
    
    const stock = await InventoryStock.findOne({ locationId, ingredientId });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const previousStock = stock.currentStock;
    stock.currentStock = Math.max(0, stock.currentStock - quantity);
    await stock.save();
    
    // Create transaction
    await InventoryTransaction.create({
      locationId,
      ingredientId,
      transactionType: 'WASTE',
      quantity,
      unitCost: stock.averageCost,
      currentStock: previousStock,
      newStock: stock.currentStock,
      reason,
      notes,
      performedBy: req.user.id
    });
    
    // Create alert for high waste
    if (quantity > stock.reorderQuantity / 2) {
      await Alert.create({
        type: 'WASTE_ALERT',
        severity: 'WARNING',
        title: 'High Waste Alert',
        message: `Significant waste logged for ${stock.ingredientId.name}: ${quantity} ${stock.uom}`,
        locationId,
        ingredientId,
        actionRequired: true
      });
    }
    
    await stock.populate('ingredientId locationId');

    res.json({
      success: true,
      data: stock,
      message: 'Waste logged successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/inventory/adjust
// @desc    Adjust inventory (manual correction)
// @access  Private
router.post('/adjust', protect, authorize('SUPER_ADMIN', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const { locationId, ingredientId, newQuantity, reason, notes } = req.body;
    
    const stock = await InventoryStock.findOne({ locationId, ingredientId });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const previousStock = stock.currentStock;
    const difference = newQuantity - previousStock;
    
    stock.currentStock = newQuantity;
    await stock.save();
    
    // Create transaction
    await InventoryTransaction.create({
      locationId,
      ingredientId,
      transactionType: 'ADJUSTMENT',
      quantity: Math.abs(difference),
      currentStock: previousStock,
      newStock: newQuantity,
      reason,
      notes,
      performedBy: req.user.id
    });
    
    await stock.populate('ingredientId locationId');

    res.json({
      success: true,
      data: stock,
      message: 'Inventory adjusted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
