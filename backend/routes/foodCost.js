import express from 'express';
import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import Order from '../models/Order.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/food-cost/recipe/:id
// @desc    Calculate detailed food cost for a recipe
// @access  Private
router.get('/recipe/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredientId')
      .populate('subRecipes.subRecipeId');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Calculate current cost based on live prices
    let currentTotalCost = 0;
    const ingredientBreakdown = [];
    
    for (const item of recipe.ingredients) {
      const ingredient = await Ingredient.findById(item.ingredientId);
      if (ingredient) {
        const cost = ingredient.currentPrice * item.quantity;
        currentTotalCost += cost;
        ingredientBreakdown.push({
          name: ingredient.name,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: ingredient.currentPrice,
          totalCost: cost,
          costPercentage: 0 // calculated later
        });
      }
    }
    
    // Calculate sub-recipe costs
    const subRecipeBreakdown = [];
    for (const item of recipe.subRecipes) {
      const subRecipe = await Recipe.findById(item.subRecipeId);
      if (subRecipe) {
        const cost = subRecipe.totalCost * item.quantity;
        currentTotalCost += cost;
        subRecipeBreakdown.push({
          name: subRecipe.name,
          quantity: item.quantity,
          unitCost: subRecipe.totalCost,
          totalCost: cost,
          costPercentage: 0
        });
      }
    }
    
    // Calculate percentages
    ingredientBreakdown.forEach(item => {
      item.costPercentage = (item.totalCost / currentTotalCost) * 100;
    });
    subRecipeBreakdown.forEach(item => {
      item.costPercentage = (item.totalCost / currentTotalCost) * 100;
    });
    
    // Calculate cost per serving
    const costPerServing = recipe.yield?.quantity 
      ? currentTotalCost / recipe.yield.quantity 
      : currentTotalCost;
    
    // Calculate food cost percentage
    const foodCostPercentage = recipe.menuPrice 
      ? (currentTotalCost / recipe.menuPrice) * 100 
      : 0;
    
    // Determine if food cost is high
    const isHighFoodCost = foodCostPercentage > 35; // Industry standard is 28-35%
    
    // Calculate profit margin
    const profitPerServing = recipe.menuPrice ? recipe.menuPrice - costPerServing : 0;
    const profitMargin = recipe.menuPrice ? (profitPerServing / recipe.menuPrice) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        recipeId: recipe._id,
        recipeName: recipe.name,
        currentTotalCost,
        previousTotalCost: recipe.totalCost,
        costChange: currentTotalCost - recipe.totalCost,
        costChangePercentage: recipe.totalCost ? ((currentTotalCost - recipe.totalCost) / recipe.totalCost) * 100 : 0,
        costPerServing,
        yield: recipe.yield,
        menuPrice: recipe.menuPrice,
        foodCostPercentage,
        isHighFoodCost,
        profitPerServing,
        profitMargin,
        ingredientBreakdown,
        subRecipeBreakdown,
        recommendations: isHighFoodCost ? [
          'Consider negotiating better prices with suppliers',
          'Look for substitute ingredients with lower costs',
          'Adjust portion sizes',
          'Increase menu price if market allows'
        ] : []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/food-cost/comparison
// @desc    Compare theoretical vs actual food cost
// @access  Private
router.get('/comparison', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { locationId, startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Get all orders in date range
    const orders = await Order.find({
      locationId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $nin: ['CANCELLED'] }
    }).populate('items.recipeId');
    
    // Calculate theoretical cost (based on recipes)
    const theoreticalCost = orders.reduce((sum, order) => sum + (order.totalFoodCost || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate actual cost (based on inventory usage)
    const actualUsage = await InventoryTransaction.find({
      locationId,
      transactionType: 'USAGE',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    const actualCost = actualUsage.reduce((sum, txn) => sum + (txn.totalCost || 0), 0);
    
    // Calculate variance
    const variance = actualCost - theoreticalCost;
    const variancePercentage = theoreticalCost ? (variance / theoreticalCost) * 100 : 0;
    
    const theoreticalFCPercentage = totalRevenue ? (theoreticalCost / totalRevenue) * 100 : 0;
    const actualFCPercentage = totalRevenue ? (actualCost / totalRevenue) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalRevenue,
        theoretical: {
          cost: theoreticalCost,
          percentage: theoreticalFCPercentage
        },
        actual: {
          cost: actualCost,
          percentage: actualFCPercentage
        },
        variance: {
          amount: variance,
          percentage: variancePercentage
        },
        analysis: variance > 0 ? [
          'Actual cost exceeds theoretical cost',
          'Possible causes: waste, theft, over-portioning, recipe non-compliance',
          'Recommend inventory audit and staff training'
        ] : [
          'Food cost is within acceptable range'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/food-cost/high-cost-items
// @desc    Get recipes with high food cost percentage
// @access  Private
router.get('/high-cost-items', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { locationId, threshold = 35 } = req.query;
    
    let query = { 
      isActive: true,
      menuPrice: { $gt: 0 },
      foodCostPercentage: { $gt: threshold }
    };
    
    if (locationId) {
      query.locations = locationId;
    }
    
    const highCostRecipes = await Recipe.find(query)
      .populate('ingredients.ingredientId')
      .sort({ foodCostPercentage: -1 });
    
    res.json({
      success: true,
      count: highCostRecipes.length,
      threshold,
      data: highCostRecipes.map(recipe => ({
        id: recipe._id,
        name: recipe.name,
        category: recipe.category,
        totalCost: recipe.totalCost,
        menuPrice: recipe.menuPrice,
        foodCostPercentage: recipe.foodCostPercentage,
        profitMargin: recipe.menuPrice ? ((recipe.menuPrice - recipe.totalCost) / recipe.menuPrice) * 100 : 0
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
