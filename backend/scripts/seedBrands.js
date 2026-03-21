import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Brand from '../models/Brand.js';
import Ingredient from '../models/Ingredient.js';
import Recipe from '../models/Recipe.js';
import Customer from '../models/Customer.js';
import FinancialRecord from '../models/FinancialRecord.js';
import SalesData from '../models/SalesData.js';
import InventoryStock from '../models/InventoryStock.js';
import Location from '../models/Location.js';
import Supplier from '../models/Supplier.js';

dotenv.config();

const seedBrandsData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear brand-specific data
    await Brand.deleteMany({});
    await Customer.deleteMany({});
    await FinancialRecord.deleteMany({});
    // Clear ingredients with brand-specific SKUs
    await Ingredient.deleteMany({ sku: { $regex: /^(TBC|KK)-/ } });
    // Clear brand-specific recipes
    await Recipe.deleteMany({ brandId: { $exists: true } });
    console.log('✅ Cleared existing brand data');

    // ============================================
    // 1. CREATE TWO BRANDS
    // ============================================
    const brands = await Brand.insertMany([
      {
        name: 'The Burger Co',
        code: 'TBC',
        description: 'Premium fast food burgers with a twist',
        cuisineType: 'FAST_FOOD',
        colorPrimary: '#E04D30',
        colorSecondary: '#FFB800',
        targetRevenue: 1000000, // 10L monthly target
        targetCOGS: 35,
        targetAggregatorFees: 50,
        targetNetProfit: 15,
        crmIntegration: {
          googleMyBusiness: true,
          crmEnabled: true,
          crmProvider: 'Hubspot'
        },
        loyaltySettings: {
          enabled: true,
          pointsPerRupee: 1,
          redemptionRate: 100
        }
      },
      {
        name: 'Kerala Kitchen',
        code: 'KK',
        description: 'Authentic South Indian coastal cuisine',
        cuisineType: 'ETHNIC',
        colorPrimary: '#2E6A4F',
        colorSecondary: '#D4A373',
        targetRevenue: 1000000, // 10L monthly target
        targetCOGS: 35,
        targetAggregatorFees: 50,
        targetNetProfit: 15,
        crmIntegration: {
          googleMyBusiness: false,
          crmEnabled: true,
          crmProvider: 'Zoho CRM'
        },
        loyaltySettings: {
          enabled: true,
          pointsPerRupee: 2,
          redemptionRate: 150
        }
      }
    ]);
    console.log(`✅ Created ${brands.length} brands`);

    const [burgerBrand, keralaBrand] = brands;

    // ============================================
    // 2. CREATE BRAND-SPECIFIC INGREDIENTS
    // ============================================
    
    // Get existing suppliers or create basic ones
    let suppliers = await Supplier.find({});
    if (suppliers.length === 0) {
      suppliers = [{ _id: null }, { _id: null }, { _id: null }, { _id: null }];
    }

    // Burger Co Ingredients
    const burgerIngredients = await Ingredient.insertMany([
      // Proteins
      { name: 'Beef Patty (200g)', sku: 'TBC-001', category: 'MEAT', baseUOM: 'PC', currentPrice: 85, reorderLevel: 200, reorderQuantity: 500, brandId: burgerBrand._id },
      { name: 'Chicken Patty (180g)', sku: 'TBC-002', category: 'MEAT', baseUOM: 'PC', currentPrice: 65, reorderLevel: 200, reorderQuantity: 500, brandId: burgerBrand._id },
      { name: 'Veggie Patty (150g)', sku: 'TBC-003', category: 'PRODUCE', baseUOM: 'PC', currentPrice: 45, reorderLevel: 150, reorderQuantity: 400, brandId: burgerBrand._id },
      // Buns & Bread
      { name: 'Brioche Bun', sku: 'TBC-004', category: 'BAKERY', baseUOM: 'PC', currentPrice: 18, reorderLevel: 300, reorderQuantity: 600, brandId: burgerBrand._id },
      { name: 'Whole Wheat Bun', sku: 'TBC-005', category: 'BAKERY', baseUOM: 'PC', currentPrice: 15, reorderLevel: 200, reorderQuantity: 400, brandId: burgerBrand._id },
      // Sauces
      { name: 'Signature Burger Sauce', sku: 'TBC-006', category: 'OTHER', baseUOM: 'L', currentPrice: 280, reorderLevel: 20, reorderQuantity: 50, brandId: burgerBrand._id },
      { name: 'Chipotle Mayo', sku: 'TBC-007', category: 'OTHER', baseUOM: 'L', currentPrice: 320, reorderLevel: 15, reorderQuantity: 40, brandId: burgerBrand._id },
      { name: 'BBQ Sauce', sku: 'TBC-008', category: 'OTHER', baseUOM: 'L', currentPrice: 180, reorderLevel: 25, reorderQuantity: 60, brandId: burgerBrand._id },
      // Toppings
      { name: 'Cheddar Cheese Slice', sku: 'TBC-009', category: 'DAIRY', baseUOM: 'PC', currentPrice: 12, reorderLevel: 500, reorderQuantity: 1000, brandId: burgerBrand._id },
      { name: 'Iceberg Lettuce', sku: 'TBC-010', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 80, reorderLevel: 30, reorderQuantity: 60, brandId: burgerBrand._id },
      { name: 'Tomato Slices', sku: 'TBC-011', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 50, reorderLevel: 40, reorderQuantity: 80, brandId: burgerBrand._id },
      { name: 'Pickled Onions', sku: 'TBC-012', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 120, reorderLevel: 15, reorderQuantity: 30, brandId: burgerBrand._id },
      // Sides
      { name: 'Frozen French Fries', sku: 'TBC-013', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 95, reorderLevel: 100, reorderQuantity: 200, brandId: burgerBrand._id },
      { name: 'Onion Rings (Frozen)', sku: 'TBC-014', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 140, reorderLevel: 50, reorderQuantity: 100, brandId: burgerBrand._id },
      { name: 'Cooking Oil', sku: 'TBC-015', category: 'DRY_GOODS', baseUOM: 'L', currentPrice: 150, reorderLevel: 50, reorderQuantity: 100, brandId: burgerBrand._id },
    ]);

    // Kerala Kitchen Ingredients
    const keralaIngredients = await Ingredient.insertMany([
      // Proteins
      { name: 'Fresh Prawns', sku: 'KK-001', category: 'SEAFOOD', baseUOM: 'KG', currentPrice: 850, reorderLevel: 20, reorderQuantity: 50, brandId: keralaBrand._id },
      { name: 'Fish (Pearl Spot)', sku: 'KK-002', category: 'SEAFOOD', baseUOM: 'KG', currentPrice: 650, reorderLevel: 25, reorderQuantity: 60, brandId: keralaBrand._id },
      { name: 'Crab', sku: 'KK-003', category: 'SEAFOOD', baseUOM: 'KG', currentPrice: 750, reorderLevel: 15, reorderQuantity: 40, brandId: keralaBrand._id },
      { name: 'Chicken (Kerala Style Cut)', sku: 'KK-004', category: 'MEAT', baseUOM: 'KG', currentPrice: 280, reorderLevel: 40, reorderQuantity: 80, brandId: keralaBrand._id },
      // Base Ingredients
      { name: 'Coconut Oil', sku: 'KK-005', category: 'DRY_GOODS', baseUOM: 'L', currentPrice: 320, reorderLevel: 30, reorderQuantity: 60, brandId: keralaBrand._id },
      { name: 'Coconut Milk', sku: 'KK-006', category: 'DRY_GOODS', baseUOM: 'L', currentPrice: 180, reorderLevel: 40, reorderQuantity: 80, brandId: keralaBrand._id },
      { name: 'Grated Coconut', sku: 'KK-007', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 150, reorderLevel: 30, reorderQuantity: 60, brandId: keralaBrand._id },
      // Rice & Grains
      { name: 'Kerala Matta Rice', sku: 'KK-008', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 85, reorderLevel: 100, reorderQuantity: 200, brandId: keralaBrand._id },
      { name: 'Appam Batter (Ready)', sku: 'KK-009', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 120, reorderLevel: 50, reorderQuantity: 100, brandId: keralaBrand._id },
      // Spices (Kerala Special)
      { name: 'Kerala Garam Masala', sku: 'KK-010', category: 'SPICES', baseUOM: 'KG', currentPrice: 650, reorderLevel: 5, reorderQuantity: 15, brandId: keralaBrand._id },
      { name: 'Fish Masala', sku: 'KK-011', category: 'SPICES', baseUOM: 'KG', currentPrice: 480, reorderLevel: 8, reorderQuantity: 20, brandId: keralaBrand._id },
      { name: 'Black Pepper (Whole)', sku: 'KK-012', category: 'SPICES', baseUOM: 'KG', currentPrice: 950, reorderLevel: 3, reorderQuantity: 10, brandId: keralaBrand._id },
      { name: 'Curry Leaves', sku: 'KK-013', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 200, reorderLevel: 10, reorderQuantity: 25, brandId: keralaBrand._id },
      { name: 'Tamarind Paste', sku: 'KK-014', category: 'SPICES', baseUOM: 'KG', currentPrice: 180, reorderLevel: 10, reorderQuantity: 25, brandId: keralaBrand._id },
      { name: 'Shallots', sku: 'KK-015', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 90, reorderLevel: 30, reorderQuantity: 60, brandId: keralaBrand._id },
    ]);

    console.log(`✅ Created ${burgerIngredients.length + keralaIngredients.length} brand-specific ingredients`);

    // ============================================
    // 3. CREATE BRAND-SPECIFIC RECIPES
    // ============================================

    // Get or create a location
    let locations = await Location.find({});
    if (locations.length === 0) {
      locations = await Location.insertMany([
        { name: 'Main Kitchen', code: 'MK01', type: 'CENTRAL_KITCHEN', isActive: true }
      ]);
    }

    // Burger Co Recipes
    const burgerRecipes = await Recipe.insertMany([
      {
        name: 'Classic Beef Burger',
        code: 'TBC-R001',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'The Burger Co',
        brandId: burgerBrand._id,
        ingredients: [
          { ingredientId: burgerIngredients[0]._id, quantity: 1, uom: 'PC', cost: 85 },
          { ingredientId: burgerIngredients[3]._id, quantity: 1, uom: 'PC', cost: 18 },
          { ingredientId: burgerIngredients[5]._id, quantity: 0.03, uom: 'L', cost: 8.4 },
          { ingredientId: burgerIngredients[8]._id, quantity: 2, uom: 'PC', cost: 24 },
          { ingredientId: burgerIngredients[9]._id, quantity: 0.03, uom: 'KG', cost: 2.4 },
          { ingredientId: burgerIngredients[10]._id, quantity: 0.04, uom: 'KG', cost: 2 },
        ],
        totalCost: 139.8,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 139.8,
        menuPrice: 299,
        foodCostPercentage: 46.8, // Over target - should trigger warning
        prepTime: 10,
        cookTime: 8,
        difficulty: 'EASY',
        isActive: true
      },
      {
        name: 'Double Chicken Burger',
        code: 'TBC-R002',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'The Burger Co',
        brandId: burgerBrand._id,
        ingredients: [
          { ingredientId: burgerIngredients[1]._id, quantity: 2, uom: 'PC', cost: 130 },
          { ingredientId: burgerIngredients[3]._id, quantity: 1, uom: 'PC', cost: 18 },
          { ingredientId: burgerIngredients[6]._id, quantity: 0.03, uom: 'L', cost: 9.6 },
          { ingredientId: burgerIngredients[8]._id, quantity: 2, uom: 'PC', cost: 24 },
          { ingredientId: burgerIngredients[9]._id, quantity: 0.03, uom: 'KG', cost: 2.4 },
        ],
        totalCost: 184,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 184,
        menuPrice: 399,
        foodCostPercentage: 46.1,
        prepTime: 12,
        cookTime: 10,
        difficulty: 'EASY',
        isActive: true
      },
      {
        name: 'Veggie Delight Burger',
        code: 'TBC-R003',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'The Burger Co',
        brandId: burgerBrand._id,
        ingredients: [
          { ingredientId: burgerIngredients[2]._id, quantity: 1, uom: 'PC', cost: 45 },
          { ingredientId: burgerIngredients[4]._id, quantity: 1, uom: 'PC', cost: 15 },
          { ingredientId: burgerIngredients[5]._id, quantity: 0.03, uom: 'L', cost: 8.4 },
          { ingredientId: burgerIngredients[9]._id, quantity: 0.05, uom: 'KG', cost: 4 },
          { ingredientId: burgerIngredients[10]._id, quantity: 0.05, uom: 'KG', cost: 2.5 },
        ],
        totalCost: 74.9,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 74.9,
        menuPrice: 249,
        foodCostPercentage: 30.1, // Good margin
        prepTime: 8,
        cookTime: 6,
        difficulty: 'EASY',
        isActive: true
      },
      {
        name: 'Loaded Fries',
        code: 'TBC-R004',
        type: 'MAIN',
        category: 'APPETIZER',
        brand: 'The Burger Co',
        brandId: burgerBrand._id,
        ingredients: [
          { ingredientId: burgerIngredients[12]._id, quantity: 0.2, uom: 'KG', cost: 19 },
          { ingredientId: burgerIngredients[8]._id, quantity: 2, uom: 'PC', cost: 24 },
          { ingredientId: burgerIngredients[7]._id, quantity: 0.02, uom: 'L', cost: 3.6 },
          { ingredientId: burgerIngredients[14]._id, quantity: 0.1, uom: 'L', cost: 15 },
        ],
        totalCost: 61.6,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 61.6,
        menuPrice: 149,
        foodCostPercentage: 41.3,
        prepTime: 5,
        cookTime: 8,
        difficulty: 'EASY',
        isActive: true
      },
      {
        name: 'BBQ Beef Burger',
        code: 'TBC-R005',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'The Burger Co',
        brandId: burgerBrand._id,
        ingredients: [
          { ingredientId: burgerIngredients[0]._id, quantity: 1, uom: 'PC', cost: 85 },
          { ingredientId: burgerIngredients[3]._id, quantity: 1, uom: 'PC', cost: 18 },
          { ingredientId: burgerIngredients[7]._id, quantity: 0.04, uom: 'L', cost: 7.2 },
          { ingredientId: burgerIngredients[8]._id, quantity: 2, uom: 'PC', cost: 24 },
          { ingredientId: burgerIngredients[11]._id, quantity: 0.03, uom: 'KG', cost: 3.6 },
        ],
        totalCost: 137.8,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 137.8,
        menuPrice: 329,
        foodCostPercentage: 41.9,
        prepTime: 10,
        cookTime: 10,
        difficulty: 'EASY',
        isActive: true
      },
    ]);

    // Kerala Kitchen Recipes
    const keralaRecipes = await Recipe.insertMany([
      {
        name: 'Prawn Roast (Chemmeen Roast)',
        code: 'KK-R001',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[0]._id, quantity: 0.25, uom: 'KG', cost: 212.5 },
          { ingredientId: keralaIngredients[4]._id, quantity: 0.05, uom: 'L', cost: 16 },
          { ingredientId: keralaIngredients[9]._id, quantity: 0.02, uom: 'KG', cost: 13 },
          { ingredientId: keralaIngredients[12]._id, quantity: 0.01, uom: 'KG', cost: 2 },
          { ingredientId: keralaIngredients[14]._id, quantity: 0.05, uom: 'KG', cost: 4.5 },
        ],
        totalCost: 248,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 248,
        menuPrice: 450,
        foodCostPercentage: 55.1, // Very high - should trigger warning
        prepTime: 15,
        cookTime: 20,
        difficulty: 'MEDIUM',
        isActive: true
      },
      {
        name: 'Kerala Fish Curry (Meen Curry)',
        code: 'KK-R002',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[1]._id, quantity: 0.2, uom: 'KG', cost: 130 },
          { ingredientId: keralaIngredients[5]._id, quantity: 0.15, uom: 'L', cost: 27 },
          { ingredientId: keralaIngredients[10]._id, quantity: 0.015, uom: 'KG', cost: 7.2 },
          { ingredientId: keralaIngredients[13]._id, quantity: 0.02, uom: 'KG', cost: 3.6 },
          { ingredientId: keralaIngredients[12]._id, quantity: 0.01, uom: 'KG', cost: 2 },
        ],
        totalCost: 169.8,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 169.8,
        menuPrice: 380,
        foodCostPercentage: 44.7,
        prepTime: 10,
        cookTime: 25,
        difficulty: 'MEDIUM',
        isActive: true
      },
      {
        name: 'Kerala Chicken Fry (Kozhi Porichathu)',
        code: 'KK-R003',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[3]._id, quantity: 0.25, uom: 'KG', cost: 70 },
          { ingredientId: keralaIngredients[4]._id, quantity: 0.1, uom: 'L', cost: 32 },
          { ingredientId: keralaIngredients[9]._id, quantity: 0.02, uom: 'KG', cost: 13 },
          { ingredientId: keralaIngredients[12]._id, quantity: 0.015, uom: 'KG', cost: 3 },
          { ingredientId: keralaIngredients[11]._id, quantity: 0.005, uom: 'KG', cost: 4.75 },
        ],
        totalCost: 122.75,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 122.75,
        menuPrice: 320,
        foodCostPercentage: 38.4, // Slightly over target
        prepTime: 20,
        cookTime: 30,
        difficulty: 'MEDIUM',
        isActive: true
      },
      {
        name: 'Appam with Stew',
        code: 'KK-R004',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[8]._id, quantity: 0.15, uom: 'KG', cost: 18 },
          { ingredientId: keralaIngredients[5]._id, quantity: 0.2, uom: 'L', cost: 36 },
          { ingredientId: keralaIngredients[3]._id, quantity: 0.1, uom: 'KG', cost: 28 },
          { ingredientId: keralaIngredients[12]._id, quantity: 0.01, uom: 'KG', cost: 2 },
        ],
        totalCost: 84,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 84,
        menuPrice: 280,
        foodCostPercentage: 30, // Good margin
        prepTime: 10,
        cookTime: 15,
        difficulty: 'EASY',
        isActive: true
      },
      {
        name: 'Crab Masala (Njandu Curry)',
        code: 'KK-R005',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[2]._id, quantity: 0.3, uom: 'KG', cost: 225 },
          { ingredientId: keralaIngredients[4]._id, quantity: 0.05, uom: 'L', cost: 16 },
          { ingredientId: keralaIngredients[9]._id, quantity: 0.025, uom: 'KG', cost: 16.25 },
          { ingredientId: keralaIngredients[5]._id, quantity: 0.1, uom: 'L', cost: 18 },
          { ingredientId: keralaIngredients[14]._id, quantity: 0.05, uom: 'KG', cost: 4.5 },
        ],
        totalCost: 279.75,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 279.75,
        menuPrice: 520,
        foodCostPercentage: 53.8, // Very high
        prepTime: 25,
        cookTime: 35,
        difficulty: 'HARD',
        isActive: true
      },
      {
        name: 'Matta Rice Meals',
        code: 'KK-R006',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'Kerala Kitchen',
        brandId: keralaBrand._id,
        ingredients: [
          { ingredientId: keralaIngredients[7]._id, quantity: 0.2, uom: 'KG', cost: 17 },
          { ingredientId: keralaIngredients[6]._id, quantity: 0.05, uom: 'KG', cost: 7.5 },
        ],
        totalCost: 24.5,
        yield: { quantity: 1, uom: 'servings' },
        costPerServing: 24.5,
        menuPrice: 120,
        foodCostPercentage: 20.4, // Excellent margin
        prepTime: 5,
        cookTime: 25,
        difficulty: 'EASY',
        isActive: true
      },
    ]);

    console.log(`✅ Created ${burgerRecipes.length + keralaRecipes.length} brand-specific recipes`);

    // ============================================
    // 4. CREATE 3 MONTHS OF FINANCIAL DATA
    // ============================================
    const today = new Date();
    const financialRecords = [];
    
    // Generate 90 days (3 months) of data for each brand
    // Total target: 20L shared = 10L per brand over 3 months
    // Monthly target per brand: ~3.33L
    
    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // BURGER CO - High volume, lower average order
      let burgerRevenue = 28000 + Math.random() * 15000; // Base ~28k-43k daily
      if (isWeekend) burgerRevenue *= 1.5; // Weekend boost
      
      const burgerCOGS = burgerRevenue * (0.32 + Math.random() * 0.08); // 32-40% COGS
      const burgerFees = burgerRevenue * 0.50; // 50% aggregator + marketing
      const burgerOrders = Math.floor(burgerRevenue / 350); // ~350 avg order
      
      financialRecords.push({
        brandId: burgerBrand._id,
        date,
        grossRevenue: Math.round(burgerRevenue),
        discounts: Math.round(burgerRevenue * 0.05),
        cogs: Math.round(burgerCOGS),
        aggregatorFees: Math.round(burgerFees * 0.6),
        marketingFees: Math.round(burgerFees * 0.4),
        laborCost: Math.round(burgerRevenue * 0.12),
        overheadCost: Math.round(burgerRevenue * 0.05),
        totalOrders: burgerOrders,
        topSellingCategories: [
          { category: 'Burgers', revenue: Math.round(burgerRevenue * 0.65), percentage: 65 },
          { category: 'Sides', revenue: Math.round(burgerRevenue * 0.25), percentage: 25 },
          { category: 'Beverages', revenue: Math.round(burgerRevenue * 0.10), percentage: 10 },
        ]
      });
      
      // KERALA KITCHEN - Lower volume, higher average order
      let keralaRevenue = 25000 + Math.random() * 12000; // Base ~25k-37k daily
      if (isWeekend) keralaRevenue *= 1.4;
      
      const keralaCOGS = keralaRevenue * (0.35 + Math.random() * 0.10); // 35-45% COGS (seafood is expensive)
      const keralaFees = keralaRevenue * 0.50;
      const keralaOrders = Math.floor(keralaRevenue / 420); // ~420 avg order
      
      financialRecords.push({
        brandId: keralaBrand._id,
        date,
        grossRevenue: Math.round(keralaRevenue),
        discounts: Math.round(keralaRevenue * 0.03),
        cogs: Math.round(keralaCOGS),
        aggregatorFees: Math.round(keralaFees * 0.5),
        marketingFees: Math.round(keralaFees * 0.5),
        laborCost: Math.round(keralaRevenue * 0.15),
        overheadCost: Math.round(keralaRevenue * 0.06),
        totalOrders: keralaOrders,
        topSellingCategories: [
          { category: 'Seafood', revenue: Math.round(keralaRevenue * 0.45), percentage: 45 },
          { category: 'Chicken', revenue: Math.round(keralaRevenue * 0.30), percentage: 30 },
          { category: 'Rice & Appam', revenue: Math.round(keralaRevenue * 0.25), percentage: 25 },
        ]
      });
    }
    
    await FinancialRecord.insertMany(financialRecords);
    console.log(`✅ Created ${financialRecords.length} financial records (90 days x 2 brands)`);

    // ============================================
    // 5. CREATE CUSTOMERS WITH FEEDBACK
    // ============================================
    const customerNames = [
      'Arjun Sharma', 'Priya Patel', 'Rahul Mehta', 'Sneha Kapoor', 'Vikram Singh',
      'Anita Desai', 'Rajesh Kumar', 'Deepa Nair', 'Suresh Reddy', 'Kavita Iyer',
      'Manish Gupta', 'Pooja Verma', 'Amit Joshi', 'Neha Agarwal', 'Karthik Menon',
      'Swati Pillai', 'Rohan Das', 'Meera Krishnan', 'Sanjay Rao', 'Divya Bhat'
    ];

    const customers = [];
    
    // Create customers for both brands
    for (let i = 0; i < 20; i++) {
      const brandId = i < 12 ? burgerBrand._id : keralaBrand._id; // 12 burger, 8 kerala
      const orders = Math.floor(Math.random() * 30) + 5;
      const spent = orders * (brandId === burgerBrand._id ? 400 : 500);
      
      customers.push({
        brandId,
        name: customerNames[i],
        email: customerNames[i].toLowerCase().replace(' ', '.') + '@email.com',
        phone: '+91-98765-' + String(10000 + i).padStart(5, '0'),
        loyaltyPoints: Math.floor(spent * 0.01),
        totalPointsEarned: Math.floor(spent * 0.015),
        totalPointsRedeemed: Math.floor(spent * 0.005),
        totalOrders: orders,
        totalSpent: spent,
        lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        feedbackHistory: [
          { rating: Math.floor(Math.random() * 2) + 4, comment: 'Great food!', date: new Date() },
          { rating: Math.floor(Math.random() * 2) + 3, comment: 'Good experience', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        ]
      });
    }
    
    await Customer.insertMany(customers);
    console.log(`✅ Created ${customers.length} customers with feedback`);

    // ============================================
    // 6. CREATE INVENTORY STOCK FOR NEW INGREDIENTS
    // ============================================
    const inventoryEntries = [];
    const allNewIngredients = [...burgerIngredients, ...keralaIngredients];
    
    for (const ingredient of allNewIngredients) {
      // Add some items with low stock for alerts
      const stockMultiplier = Math.random() > 0.3 ? 2 : 0.5; // 30% chance of low stock
      
      inventoryEntries.push({
        locationId: locations[0]._id,
        ingredientId: ingredient._id,
        currentStock: Math.floor(ingredient.reorderQuantity * stockMultiplier),
        uom: ingredient.baseUOM,
        reorderLevel: ingredient.reorderLevel,
        reorderQuantity: ingredient.reorderQuantity,
        averageCost: ingredient.currentPrice,
        lastRestocked: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      });
    }
    
    await InventoryStock.insertMany(inventoryEntries);
    console.log(`✅ Created ${inventoryEntries.length} inventory stock entries`);

    // ============================================
    // 7. UPDATE USERS FOR BRAND ACCESS
    // ============================================
    await User.updateMany(
      { role: 'SUPER_ADMIN' },
      { $set: { brandAccess: [burgerBrand._id, keralaBrand._id] } }
    );
    
    // Create brand-specific users
    const hashedPassword = await bcrypt.hash('brand123', 10);
    await User.insertMany([
      {
        email: 'manager@burgerco.com',
        password: hashedPassword,
        name: 'Burger Co Manager',
        role: 'KITCHEN_MANAGER',
        phone: '+91-98765-50001',
        brandAccess: [burgerBrand._id],
        isActive: true
      },
      {
        email: 'manager@keralakitchen.com',
        password: hashedPassword,
        name: 'Kerala Kitchen Manager',
        role: 'KITCHEN_MANAGER',
        phone: '+91-98765-50002',
        brandAccess: [keralaBrand._id],
        isActive: true
      }
    ]);
    console.log('✅ Created brand-specific users');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 BRAND DATA SEEDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   - 2 Brands (The Burger Co, Kerala Kitchen)`);
    console.log(`   - ${allNewIngredients.length} Brand-specific Ingredients`);
    console.log(`   - ${burgerRecipes.length + keralaRecipes.length} Brand-specific Recipes`);
    console.log(`   - ${financialRecords.length} Financial Records (3 months)`);
    console.log(`   - ${customers.length} Customers with Feedback`);
    console.log(`   - ${inventoryEntries.length} Inventory Records`);
    console.log('\n💰 Financial Targets:');
    console.log('   - Total Revenue Target: ₹20,00,000 (20L)');
    console.log('   - COGS Target: 35%');
    console.log('   - Aggregator & Marketing: 50%');
    console.log('   - Net Profit Target: 15%');
    console.log('\n🔑 Test Credentials:');
    console.log('   Super Admin: admin@skopeos.com / admin123');
    console.log('   Burger Co: manager@burgerco.com / brand123');
    console.log('   Kerala Kitchen: manager@keralakitchen.com / brand123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding brand data:', error);
    process.exit(1);
  }
};

seedBrandsData();
