import express from 'express';
import Order from '../models/Order.js';
import Recipe from '../models/Recipe.js';
import InventoryStock from '../models/InventoryStock.js';
import SalesData from '../models/SalesData.js';
import Alert from '../models/Alert.js';
import Client from '../models/Client.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard/executive
// @desc    Get executive chef dashboard data
// @access  Private (Executive Chef, Super Admin)
router.get('/executive', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { locationId } = req.query;
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Get recent orders
    const recentOrders = await Order.find({
      ...(locationId && { locationId }),
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate revenue
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
    const totalFoodCost = recentOrders.reduce((sum, order) => sum + (order.totalFoodCost || 0), 0);
    const avgFoodCostPercentage = totalRevenue > 0 ? (totalFoodCost / totalRevenue) * 100 : 0;
    
    // Get high food cost recipes
    const highFoodCostRecipes = await Recipe.find({
      isActive: true,
      foodCostPercentage: { $gt: 35 },
      ...(locationId && { locations: locationId })
    }).limit(10).sort({ foodCostPercentage: -1 });
    
    // Get low stock alerts
    const lowStockAlerts = await InventoryStock.find({
      ...(locationId && { locationId }),
      status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] }
    }).populate('ingredientId').limit(10);
    
    // Get recent sales trend
    const salesTrend = await SalesData.find({
      ...(locationId && { locationId }),
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Get active alerts
    const activeAlerts = await Alert.find({
      ...(locationId && { locationId }),
      isRead: false
    }).sort({ createdAt: -1 }).limit(10);
    
    // Top selling items
    const ordersByRecipe = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const recipeId = item.recipeId.toString();
        if (!ordersByRecipe[recipeId]) {
          ordersByRecipe[recipeId] = {
            quantity: 0,
            revenue: 0
          };
        }
        ordersByRecipe[recipeId].quantity += item.quantity;
        ordersByRecipe[recipeId].revenue += item.totalPrice;
      });
    });
    
    const topSellingIds = Object.entries(ordersByRecipe)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id]) => id);
    
    const topSellingRecipes = await Recipe.find({
      _id: { $in: topSellingIds }
    });
    
    const topSelling = topSellingRecipes.map(recipe => ({
      ...recipe.toObject(),
      soldQuantity: ordersByRecipe[recipe._id.toString()].quantity,
      revenue: ordersByRecipe[recipe._id.toString()].revenue
    }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalFoodCost,
          avgFoodCostPercentage,
          totalOrders: recentOrders.length,
          activeAlerts: activeAlerts.length
        },
        highFoodCostRecipes: highFoodCostRecipes.map(r => ({
          id: r._id,
          name: r.name,
          category: r.category,
          foodCostPercentage: r.foodCostPercentage,
          totalCost: r.totalCost,
          menuPrice: r.menuPrice
        })),
        lowStockAlerts: lowStockAlerts.map(s => ({
          id: s._id,
          ingredientName: s.ingredientId?.name,
          currentStock: s.currentStock,
          uom: s.uom,
          status: s.status,
          reorderLevel: s.reorderLevel
        })),
        salesTrend: salesTrend.map(s => ({
          date: s.date,
          revenue: s.totalRevenue,
          foodCostPercentage: s.foodCostPercentage,
          orders: s.totalOrders
        })),
        topSelling,
        alerts: activeAlerts.map(a => ({
          id: a._id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/dashboard/kitchen-manager
// @desc    Get kitchen manager dashboard data
// @access  Private (Kitchen Manager)
router.get('/kitchen-manager', protect, authorize('SUPER_ADMIN', 'KITCHEN_MANAGER'), async (req, res) => {
  try {
    const { locationId } = req.query;
    
    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }
    
    // Get pending orders
    const pendingOrders = await Order.find({
      locationId,
      status: { $in: ['CONFIRMED', 'PREPARING'] }
    }).populate('clientId items.recipeId').sort({ createdAt: -1 });
    
    // Get inventory status
    const inventoryStatus = await InventoryStock.find({ locationId })
      .populate('ingredientId');
    
    const lowStock = inventoryStatus.filter(s => s.status === 'LOW_STOCK').length;
    const outOfStock = inventoryStatus.filter(s => s.status === 'OUT_OF_STOCK').length;
    const expiringSoon = inventoryStatus.filter(s => s.status === 'EXPIRING_SOON').length;
    
    // Get recent alerts
    const alerts = await Alert.find({
      locationId,
      isRead: false,
      actionRequired: true
    }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: {
        summary: {
          pendingOrders: pendingOrders.length,
          lowStockItems: lowStock,
          outOfStockItems: outOfStock,
          expiringSoonItems: expiringSoon,
          activeAlerts: alerts.length
        },
        pendingOrders: pendingOrders.map(o => ({
          id: o._id,
          orderNumber: o.orderNumber,
          client: o.clientId?.businessName,
          status: o.status,
          items: o.items.length,
          deliveryDate: o.deliveryDate,
          createdAt: o.createdAt
        })),
        inventoryAlerts: inventoryStatus
          .filter(s => s.status !== 'IN_STOCK')
          .map(s => ({
            id: s._id,
            ingredient: s.ingredientId?.name,
            currentStock: s.currentStock,
            uom: s.uom,
            status: s.status,
            reorderLevel: s.reorderLevel,
            expiryDate: s.expiryDate
          })),
        alerts: alerts.map(a => ({
          id: a._id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/dashboard/client
// @desc    Get B2B client dashboard data
// @access  Private (B2B Client)
router.get('/client', protect, authorize('B2B_CLIENT'), async (req, res) => {
  try {
    const clientId = req.user.clientId;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID not found'
      });
    }
    
    // Get client info
    const client = await Client.findById(clientId);
    
    // Get recent orders
    const recentOrders = await Order.find({ clientId })
      .populate('items.recipeId')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get order stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrdersLast30Days = recentOrders.filter(
      o => o.createdAt >= thirtyDaysAgo
    );
    
    const totalSpent = recentOrdersLast30Days.reduce((sum, o) => sum + o.total, 0);
    
    res.json({
      success: true,
      data: {
        client: {
          businessName: client.businessName,
          pricingTier: client.pricingTier,
          discountPercentage: client.discountPercentage,
          creditLimit: client.creditLimit,
          status: client.status
        },
        summary: {
          totalOrders: client.totalOrders,
          totalRevenue: client.totalRevenue,
          ordersLast30Days: recentOrdersLast30Days.length,
          spentLast30Days: totalSpent
        },
        recentOrders: recentOrders.map(o => ({
          id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.total,
          deliveryDate: o.deliveryDate,
          createdAt: o.createdAt,
          itemCount: o.items.length
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/dashboard/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/alerts/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.isRead = true;
    alert.readBy.push({
      userId: req.user.id,
      readAt: new Date()
    });
    await alert.save();

    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
