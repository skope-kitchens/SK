import express from 'express';
import Recipe from '../models/Recipe.js';
import Ingredient from '../models/Ingredient.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to calculate recipe cost
const calculateRecipeCost = async (ingredients, subRecipes) => {
  let totalCost = 0;
  
  // Calculate ingredient costs
  for (const item of ingredients) {
    const ingredient = await Ingredient.findById(item.ingredientId);
    if (ingredient) {
      item.cost = ingredient.currentPrice * item.quantity;
      totalCost += item.cost;
    }
  }
  
  // Calculate sub-recipe costs
  for (const item of subRecipes) {
    const subRecipe = await Recipe.findById(item.subRecipeId);
    if (subRecipe) {
      item.cost = subRecipe.totalCost * item.quantity;
      totalCost += item.cost;
    }
  }
  
  return totalCost;
};

// @route   GET /api/recipes
// @desc    Get all recipes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, locationId } = req.query;
    let query = { isActive: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (locationId) query.locations = locationId;
    
    const recipes = await Recipe.find(query)
      .populate('ingredients.ingredientId')
      .populate('subRecipes.subRecipeId')
      .populate('locations');
    
    res.json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredientId')
      .populate('subRecipes.subRecipeId')
      .populate('locations');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/recipes
// @desc    Create recipe
// @access  Private
router.post('/', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { ingredients = [], subRecipes = [] } = req.body;
    
    // Calculate total cost
    const totalCost = await calculateRecipeCost(ingredients, subRecipes);
    
    const recipe = await Recipe.create({
      ...req.body,
      ingredients,
      subRecipes,
      totalCost
    });
    
    await recipe.populate('ingredients.ingredientId subRecipes.subRecipeId locations');

    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update recipe
// @access  Private
router.put('/:id', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // If ingredients or subRecipes changed, recalculate cost
    if (req.body.ingredients || req.body.subRecipes) {
      const ingredients = req.body.ingredients || recipe.ingredients;
      const subRecipes = req.body.subRecipes || recipe.subRecipes;
      req.body.totalCost = await calculateRecipeCost(ingredients, subRecipes);
    }
    
    Object.assign(recipe, req.body);
    await recipe.save();
    await recipe.populate('ingredients.ingredientId subRecipes.subRecipeId locations');

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/recipes/:id/recalculate-cost
// @desc    Recalculate recipe cost based on current ingredient prices
// @access  Private
router.put('/:id/recalculate-cost', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    const totalCost = await calculateRecipeCost(recipe.ingredients, recipe.subRecipes);
    recipe.totalCost = totalCost;
    await recipe.save();
    await recipe.populate('ingredients.ingredientId subRecipes.subRecipeId');

    res.json({
      success: true,
      data: recipe,
      message: 'Recipe cost recalculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
