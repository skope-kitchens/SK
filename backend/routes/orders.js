import express from 'express';
import Order from '../models/Order.js';
import Recipe from '../models/Recipe.js';
import Client from '../models/Client.js';
import InventoryStock from '../models/InventoryStock.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Alert from '../models/Alert.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to deplete inventory (Golden Thread)
const depleteInventory = async (orderId, locationId, items) => {
  for (const item of items) {
    const recipe = await Recipe.findById(item.recipeId).populate('ingredients.ingredientId');
    
    if (!recipe) continue;
    
    // Deplete each ingredient in the recipe
    for (const recipeIngredient of recipe.ingredients) {
      const totalQuantityNeeded = recipeIngredient.quantity * item.quantity;
      
      const stock = await InventoryStock.findOne({
        locationId,
        ingredientId: recipeIngredient.ingredientId
      });
      
      if (stock) {
        const previousStock = stock.currentStock;
        stock.currentStock = Math.max(0, stock.currentStock - totalQuantityNeeded);
        stock.lastUsed = new Date();
        await stock.save();
        
        // Create inventory transaction
        await InventoryTransaction.create({
          locationId,
          ingredientId: recipeIngredient.ingredientId,
          transactionType: 'USAGE',
          quantity: totalQuantityNeeded,
          uom: recipeIngredient.uom,
          unitCost: recipeIngredient.cost / recipeIngredient.quantity,
          currentStock: previousStock,
          newStock: stock.currentStock,
          orderId,
          notes: `Order ${orderId} - ${recipe.name} x${item.quantity}`
        });
        
        // Check for low stock alert
        if (stock.status === 'LOW_STOCK' || stock.status === 'OUT_OF_STOCK') {
          await Alert.create({
            type: 'LOW_STOCK',
            severity: stock.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING',
            title: `${stock.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock Alert'}`,
            message: `${recipeIngredient.ingredientId.name} is ${stock.status === 'OUT_OF_STOCK' ? 'out of stock' : 'running low'} at ${locationId}`,
            locationId,
            ingredientId: recipeIngredient.ingredientId,
            actionRequired: true
          });
        }
      }
    }
  }
};

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, clientId, locationId, startDate, endDate } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (locationId) query.locationId = locationId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query)
      .populate('clientId')
      .populate('locationId')
      .populate('items.recipeId')
      .populate('createdBy')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientId')
      .populate('locationId')
      .populate('items.recipeId')
      .populate('createdBy');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { clientId, locationId, items } = req.body;
    
    // Get client for discount
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Calculate order totals
    let subtotal = 0;
    let totalFoodCost = 0;
    
    const orderItems = [];
    for (const item of items) {
      const recipe = await Recipe.findById(item.recipeId);
      if (!recipe) continue;
      
      const unitPrice = recipe.menuPrice || 0;
      const totalPrice = unitPrice * item.quantity;
      const foodCost = recipe.totalCost * item.quantity;
      
      orderItems.push({
        recipeId: item.recipeId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        foodCost
      });
      
      subtotal += totalPrice;
      totalFoodCost += foodCost;
    }
    
    const discount = subtotal * (client.discountPercentage / 100);
    const tax = (subtotal - discount) * 0.1; // 10% tax
    const total = subtotal - discount + tax;
    
    const order = await Order.create({
      clientId,
      locationId,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      totalFoodCost,
      createdBy: req.user.id,
      ...req.body
    });
    
    // Update client stats
    client.totalOrders += 1;
    client.totalRevenue += total;
    await client.save();
    
    await order.populate('clientId locationId items.recipeId');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status and trigger inventory depletion
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = status;
    
    // **GOLDEN THREAD**: Deplete inventory when order is confirmed
    if (status === 'CONFIRMED' && !order.inventoryDepleted) {
      await depleteInventory(order._id, order.locationId, order.items);
      order.inventoryDepleted = true;
      order.depletionDate = new Date();
    }
    
    await order.save();
    await order.populate('clientId locationId items.recipeId');

    res.json({
      success: true,
      data: order,
      message: `Order ${status.toLowerCase()}${status === 'CONFIRMED' ? ' and inventory depleted' : ''}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
