import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Location from '../models/Location.js';
import Supplier from '../models/Supplier.js';
import Ingredient from '../models/Ingredient.js';
import Recipe from '../models/Recipe.js';
import Client from '../models/Client.js';
import SalesData from '../models/SalesData.js';
import InventoryStock from '../models/InventoryStock.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Location.deleteMany({});
    await Supplier.deleteMany({});
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await Client.deleteMany({});
    await SalesData.deleteMany({});
    await InventoryStock.deleteMany({});
    console.log('✅ Cleared existing data');

    // 1. CREATE 5 LOCATIONS
    const locations = await Location.insertMany([
      {
        name: 'Downtown Central Kitchen',
        code: 'DT01',
        type: 'CENTRAL_KITCHEN',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        contact: {
          phone: '+91-22-1234-5678',
          email: 'downtown@skopeos.com',
          manager: 'Rajesh Kumar'
        },
        capacity: {
          dailyOrders: 200,
          staffCount: 25
        },
        isActive: true
      },
      {
        name: 'Airport Hub Kitchen',
        code: 'AH02',
        type: 'HUB',
        address: {
          street: '45 Airport Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110037',
          country: 'India'
        },
        contact: {
          phone: '+91-11-2345-6789',
          email: 'airport@skopeos.com',
          manager: 'Priya Sharma'
        },
        capacity: {
          dailyOrders: 300,
          staffCount: 30
        },
        isActive: true
      },
      {
        name: 'Seaside Catering Center',
        code: 'SC03',
        type: 'CATERING',
        address: {
          street: '78 Marine Drive',
          city: 'Goa',
          state: 'Goa',
          zipCode: '403001',
          country: 'India'
        },
        contact: {
          phone: '+91-832-345-6789',
          email: 'seaside@skopeos.com',
          manager: 'Anjali Desai'
        },
        capacity: {
          dailyOrders: 150,
          staffCount: 20
        },
        isActive: true
      },
      {
        name: 'Tech Park Restaurant',
        code: 'TP04',
        type: 'RESTAURANT',
        address: {
          street: '101 Tech Boulevard',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        contact: {
          phone: '+91-80-456-7890',
          email: 'techpark@skopeos.com',
          manager: 'Vikram Reddy'
        },
        capacity: {
          dailyOrders: 250,
          staffCount: 28
        },
        isActive: true
      },
      {
        name: 'Metro Warehouse Kitchen',
        code: 'MW05',
        type: 'WAREHOUSE',
        address: {
          street: '234 Industrial Area',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India'
        },
        contact: {
          phone: '+91-44-567-8901',
          email: 'metro@skopeos.com',
          manager: 'Lakshmi Iyer'
        },
        capacity: {
          dailyOrders: 180,
          staffCount: 22
        },
        isActive: true
      }
    ]);
    console.log(`✅ Created ${locations.length} locations`);

    // 2. CREATE USERS (all roles)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const chefPassword = await bcrypt.hash('chef123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    
    const users = await User.insertMany([
      {
        email: 'admin@skopeos.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        phone: '+91-98765-43210',
        isActive: true
      },
      {
        email: 'chef@skopeos.com',
        password: chefPassword,
        name: 'Executive Chef Arjun',
        role: 'EXECUTIVE_CHEF',
        phone: '+91-98765-43211',
        locationId: locations[0]._id,
        isActive: true
      },
      {
        email: 'manager1@skopeos.com',
        password: managerPassword,
        name: 'Kitchen Manager Neha',
        role: 'KITCHEN_MANAGER',
        phone: '+91-98765-43212',
        locationId: locations[1]._id,
        isActive: true
      },
      {
        email: 'manager2@skopeos.com',
        password: managerPassword,
        name: 'Kitchen Manager Rohit',
        role: 'KITCHEN_MANAGER',
        phone: '+91-98765-43213',
        locationId: locations[2]._id,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 3. CREATE SUPPLIERS
    const suppliers = await Supplier.insertMany([
      {
        name: 'Fresh Harvest Produce',
        code: 'SUP001',
        category: 'PRODUCE',
        contactPerson: { name: 'Suresh Patel', email: 'suresh@freshharvest.com', phone: '+91-99887-76655' },
        email: 'info@freshharvest.com',
        phone: '+91-22-9988-7766',
        taxId: 'GSTIN1234567890',
        paymentTerms: 'NET_30',
        minimumOrder: 5000,
        leadTime: 1,
        rating: 4.5,
        isActive: true
      },
      {
        name: 'Premium Dairy Co.',
        code: 'SUP002',
        category: 'DAIRY',
        contactPerson: { name: 'Meera Shah', email: 'meera@premiumdairy.com', phone: '+91-99887-76656' },
        email: 'orders@premiumdairy.com',
        phone: '+91-11-8877-6655',
        taxId: 'GSTIN2345678901',
        paymentTerms: 'NET_15',
        minimumOrder: 3000,
        leadTime: 2,
        rating: 4.8,
        isActive: true
      },
      {
        name: 'Quality Meats India',
        code: 'SUP003',
        category: 'MEAT',
        contactPerson: { name: 'Amit Singh', email: 'amit@qualitymeats.com', phone: '+91-99887-76657' },
        email: 'sales@qualitymeats.com',
        phone: '+91-80-7766-5544',
        taxId: 'GSTIN3456789012',
        paymentTerms: 'NET_30',
        minimumOrder: 10000,
        leadTime: 2,
        rating: 4.3,
        isActive: true
      },
      {
        name: 'Spice Kingdom',
        code: 'SUP004',
        category: 'SPICES',
        contactPerson: { name: 'Kavita Nair', email: 'kavita@spicekingdom.com', phone: '+91-99887-76658' },
        email: 'info@spicekingdom.com',
        phone: '+91-44-6655-4433',
        taxId: 'GSTIN4567890123',
        paymentTerms: 'NET_60',
        minimumOrder: 2000,
        leadTime: 3,
        rating: 4.7,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // 4. CREATE INGREDIENTS
    const ingredients = await Ingredient.insertMany([
      // Produce
      { name: 'Tomatoes', sku: 'ING001', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 40, supplier: suppliers[0]._id, reorderLevel: 50, reorderQuantity: 100 },
      { name: 'Onions', sku: 'ING002', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 35, supplier: suppliers[0]._id, reorderLevel: 60, reorderQuantity: 120 },
      { name: 'Potatoes', sku: 'ING003', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 25, supplier: suppliers[0]._id, reorderLevel: 80, reorderQuantity: 150 },
      { name: 'Bell Peppers', sku: 'ING004', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 80, supplier: suppliers[0]._id, reorderLevel: 30, reorderQuantity: 50 },
      { name: 'Lettuce', sku: 'ING005', category: 'PRODUCE', baseUOM: 'KG', currentPrice: 60, supplier: suppliers[0]._id, reorderLevel: 20, reorderQuantity: 40 },
      
      // Dairy
      { name: 'Fresh Milk', sku: 'ING006', category: 'DAIRY', baseUOM: 'L', currentPrice: 55, supplier: suppliers[1]._id, reorderLevel: 100, reorderQuantity: 200 },
      { name: 'Butter', sku: 'ING007', category: 'DAIRY', baseUOM: 'KG', currentPrice: 450, supplier: suppliers[1]._id, reorderLevel: 20, reorderQuantity: 40 },
      { name: 'Cheddar Cheese', sku: 'ING008', category: 'DAIRY', baseUOM: 'KG', currentPrice: 600, supplier: suppliers[1]._id, reorderLevel: 15, reorderQuantity: 30 },
      { name: 'Yogurt', sku: 'ING009', category: 'DAIRY', baseUOM: 'KG', currentPrice: 70, supplier: suppliers[1]._id, reorderLevel: 40, reorderQuantity: 80 },
      { name: 'Cream', sku: 'ING010', category: 'DAIRY', baseUOM: 'L', currentPrice: 180, supplier: suppliers[1]._id, reorderLevel: 25, reorderQuantity: 50 },
      
      // Meat
      { name: 'Chicken Breast', sku: 'ING011', category: 'MEAT', baseUOM: 'KG', currentPrice: 280, supplier: suppliers[2]._id, reorderLevel: 50, reorderQuantity: 100 },
      { name: 'Mutton', sku: 'ING012', category: 'MEAT', baseUOM: 'KG', currentPrice: 650, supplier: suppliers[2]._id, reorderLevel: 30, reorderQuantity: 60 },
      { name: 'Fish Fillet', sku: 'ING013', category: 'SEAFOOD', baseUOM: 'KG', currentPrice: 380, supplier: suppliers[2]._id, reorderLevel: 25, reorderQuantity: 50 },
      { name: 'Prawns', sku: 'ING014', category: 'SEAFOOD', baseUOM: 'KG', currentPrice: 850, supplier: suppliers[2]._id, reorderLevel: 20, reorderQuantity: 40 },
      
      // Spices & Dry Goods
      { name: 'Turmeric Powder', sku: 'ING015', category: 'SPICES', baseUOM: 'KG', currentPrice: 250, supplier: suppliers[3]._id, reorderLevel: 10, reorderQuantity: 20 },
      { name: 'Red Chili Powder', sku: 'ING016', category: 'SPICES', baseUOM: 'KG', currentPrice: 280, supplier: suppliers[3]._id, reorderLevel: 10, reorderQuantity: 20 },
      { name: 'Cumin Seeds', sku: 'ING017', category: 'SPICES', baseUOM: 'KG', currentPrice: 320, supplier: suppliers[3]._id, reorderLevel: 8, reorderQuantity: 15 },
      { name: 'Coriander Powder', sku: 'ING018', category: 'SPICES', baseUOM: 'KG', currentPrice: 200, supplier: suppliers[3]._id, reorderLevel: 10, reorderQuantity: 20 },
      { name: 'Garam Masala', sku: 'ING019', category: 'SPICES', baseUOM: 'KG', currentPrice: 450, supplier: suppliers[3]._id, reorderLevel: 5, reorderQuantity: 10 },
      { name: 'Salt', sku: 'ING020', category: 'SPICES', baseUOM: 'KG', currentPrice: 20, supplier: suppliers[3]._id, reorderLevel: 50, reorderQuantity: 100 },
      { name: 'Rice (Basmati)', sku: 'ING021', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 120, supplier: suppliers[3]._id, reorderLevel: 100, reorderQuantity: 200 },
      { name: 'Wheat Flour', sku: 'ING022', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 45, supplier: suppliers[3]._id, reorderLevel: 150, reorderQuantity: 300 },
      { name: 'Cooking Oil', sku: 'ING023', category: 'DRY_GOODS', baseUOM: 'L', currentPrice: 150, supplier: suppliers[0]._id, reorderLevel: 80, reorderQuantity: 150 },
      { name: 'Sugar', sku: 'ING024', category: 'DRY_GOODS', baseUOM: 'KG', currentPrice: 42, supplier: suppliers[3]._id, reorderLevel: 100, reorderQuantity: 200 },
      
      // Beverages
      { name: 'Coffee Beans', sku: 'ING025', category: 'BEVERAGES', baseUOM: 'KG', currentPrice: 850, supplier: suppliers[3]._id, reorderLevel: 15, reorderQuantity: 30 },
      { name: 'Tea Leaves', sku: 'ING026', category: 'BEVERAGES', baseUOM: 'KG', currentPrice: 320, supplier: suppliers[3]._id, reorderLevel: 20, reorderQuantity: 40 }
    ]);
    console.log(`✅ Created ${ingredients.length} ingredients`);

    // 5. CREATE SUB-RECIPES
    const subRecipes = await Recipe.insertMany([
      {
        name: 'Basic Tomato Sauce',
        code: 'SUB001',
        type: 'SUB',
        category: 'SAUCE',
        ingredients: [
          { ingredientId: ingredients[0]._id, quantity: 2, uom: 'KG', cost: 80 },
          { ingredientId: ingredients[1]._id, quantity: 0.5, uom: 'KG', cost: 17.5 },
          { ingredientId: ingredients[22]._id, quantity: 0.1, uom: 'L', cost: 15 }
        ],
        totalCost: 112.5,
        yield: { quantity: 2.5, uom: 'L' },
        prepTime: 30,
        instructions: ['Chop tomatoes and onions', 'Sauté in oil', 'Simmer for 20 minutes'],
        isActive: true
      },
      {
        name: 'Spice Mix Masala',
        code: 'SUB002',
        type: 'SUB',
        category: 'COMPONENT',
        ingredients: [
          { ingredientId: ingredients[14]._id, quantity: 0.1, uom: 'KG', cost: 25 },
          { ingredientId: ingredients[15]._id, quantity: 0.1, uom: 'KG', cost: 28 },
          { ingredientId: ingredients[16]._id, quantity: 0.05, uom: 'KG', cost: 16 },
          { ingredientId: ingredients[17]._id, quantity: 0.1, uom: 'KG', cost: 20 }
        ],
        totalCost: 89,
        yield: { quantity: 0.35, uom: 'KG' },
        prepTime: 10,
        instructions: ['Mix all spices thoroughly', 'Store in airtight container'],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${subRecipes.length} sub-recipes`);

    // 6. CREATE MAIN RECIPES
    const mainRecipes = await Recipe.insertMany([
      {
        name: 'Chicken Tikka Masala',
        code: 'RCP001',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'SkopeOS Signature',
        ingredients: [
          { ingredientId: ingredients[10]._id, quantity: 1, uom: 'KG', cost: 280 },
          { ingredientId: ingredients[5]._id, quantity: 0.5, uom: 'L', cost: 27.5 },
          { ingredientId: ingredients[9]._id, quantity: 0.3, uom: 'L', cost: 54 },
          { ingredientId: ingredients[1]._id, quantity: 0.3, uom: 'KG', cost: 10.5 },
          { ingredientId: ingredients[18]._id, quantity: 0.05, uom: 'KG', cost: 22.5 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[0]._id, quantity: 0.5, cost: 56.25 },
          { subRecipeId: subRecipes[1]._id, quantity: 0.2, cost: 50.8 }
        ],
        totalCost: 501.55,
        yield: { quantity: 8, uom: 'servings' },
        costPerServing: 62.69,
        menuPrice: 250,
        foodCostPercentage: 25.08,
        prepTime: 45,
        cookTime: 30,
        difficulty: 'MEDIUM',
        instructions: ['Marinate chicken', 'Grill chicken', 'Prepare sauce', 'Combine and simmer'],
        locations: [locations[0]._id, locations[1]._id, locations[3]._id],
        isActive: true
      },
      {
        name: 'Vegetable Biryani',
        code: 'RCP002',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        ingredients: [
          { ingredientId: ingredients[20]._id, quantity: 1, uom: 'KG', cost: 120 },
          { ingredientId: ingredients[2]._id, quantity: 0.5, uom: 'KG', cost: 12.5 },
          { ingredientId: ingredients[0]._id, quantity: 0.3, uom: 'KG', cost: 12 },
          { ingredientId: ingredients[1]._id, quantity: 0.3, uom: 'KG', cost: 10.5 },
          { ingredientId: ingredients[3]._id, quantity: 0.2, uom: 'KG', cost: 16 },
          { ingredientId: ingredients[8]._id, quantity: 0.2, uom: 'KG', cost: 14 },
          { ingredientId: ingredients[22]._id, quantity: 0.15, uom: 'L', cost: 22.5 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[1]._id, quantity: 0.15, cost: 38.1 }
        ],
        totalCost: 245.6,
        yield: { quantity: 6, uom: 'servings' },
        costPerServing: 40.93,
        menuPrice: 180,
        foodCostPercentage: 22.74,
        prepTime: 30,
        cookTime: 40,
        difficulty: 'MEDIUM',
        instructions: ['Prepare vegetables', 'Par-cook rice', 'Layer rice and vegetables', 'Dum cook'],
        locations: [locations[0]._id, locations[2]._id, locations[3]._id],
        isActive: true
      },
      {
        name: 'Butter Chicken',
        code: 'RCP003',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'SkopeOS Premium',
        ingredients: [
          { ingredientId: ingredients[10]._id, quantity: 1.2, uom: 'KG', cost: 336 },
          { ingredientId: ingredients[6]._id, quantity: 0.2, uom: 'KG', cost: 90 },
          { ingredientId: ingredients[9]._id, quantity: 0.4, uom: 'L', cost: 72 },
          { ingredientId: ingredients[5]._id, quantity: 0.3, uom: 'L', cost: 16.5 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[0]._id, quantity: 0.6, cost: 67.5 },
          { subRecipeId: subRecipes[1]._id, quantity: 0.15, cost: 38.1 }
        ],
        totalCost: 620.1,
        yield: { quantity: 8, uom: 'servings' },
        costPerServing: 77.51,
        menuPrice: 280,
        foodCostPercentage: 27.68,
        prepTime: 40,
        cookTime: 35,
        difficulty: 'MEDIUM',
        instructions: ['Marinate chicken overnight', 'Tandoor roast', 'Prepare gravy', 'Combine'],
        locations: locations.map(l => l._id),
        isActive: true
      },
      {
        name: 'Paneer Tikka',
        code: 'RCP004',
        type: 'MAIN',
        category: 'APPETIZER',
        ingredients: [
          { ingredientId: ingredients[7]._id, quantity: 0.8, uom: 'KG', cost: 480 },
          { ingredientId: ingredients[3]._id, quantity: 0.3, uom: 'KG', cost: 24 },
          { ingredientId: ingredients[8]._id, quantity: 0.2, uom: 'KG', cost: 14 },
          { ingredientId: ingredients[1]._id, quantity: 0.2, uom: 'KG', cost: 7 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[1]._id, quantity: 0.1, cost: 25.4 }
        ],
        totalCost: 550.4,
        yield: { quantity: 10, uom: 'servings' },
        costPerServing: 55.04,
        menuPrice: 200,
        foodCostPercentage: 27.52,
        prepTime: 25,
        cookTime: 15,
        difficulty: 'EASY',
        instructions: ['Cut paneer cubes', 'Marinate', 'Skewer with vegetables', 'Grill'],
        locations: [locations[0]._id, locations[1]._id, locations[3]._id],
        isActive: true
      },
      {
        name: 'Fish Curry',
        code: 'RCP005',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        ingredients: [
          { ingredientId: ingredients[12]._id, quantity: 1, uom: 'KG', cost: 380 },
          { ingredientId: ingredients[0]._id, quantity: 0.4, uom: 'KG', cost: 16 },
          { ingredientId: ingredients[1]._id, quantity: 0.3, uom: 'KG', cost: 10.5 },
          { ingredientId: ingredients[9]._id, quantity: 0.2, uom: 'L', cost: 36 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[0]._id, quantity: 0.4, cost: 45 },
          { subRecipeId: subRecipes[1]._id, quantity: 0.18, cost: 45.5 }
        ],
        totalCost: 533,
        yield: { quantity: 6, uom: 'servings' },
        costPerServing: 88.83,
        menuPrice: 320,
        foodCostPercentage: 27.76,
        prepTime: 20,
        cookTime: 25,
        difficulty: 'EASY',
        instructions: ['Clean fish', 'Prepare masala', 'Cook fish in gravy', 'Garnish'],
        locations: [locations[2]._id, locations[4]._id],
        isActive: true
      },
      {
        name: 'Mutton Rogan Josh',
        code: 'RCP006',
        type: 'MAIN',
        category: 'MAIN_COURSE',
        brand: 'SkopeOS Premium',
        ingredients: [
          { ingredientId: ingredients[11]._id, quantity: 1.5, uom: 'KG', cost: 975 },
          { ingredientId: ingredients[8]._id, quantity: 0.3, uom: 'KG', cost: 21 },
          { ingredientId: ingredients[1]._id, quantity: 0.4, uom: 'KG', cost: 14 },
          { ingredientId: ingredients[22]._id, quantity: 0.15, uom: 'L', cost: 22.5 }
        ],
        subRecipes: [
          { subRecipeId: subRecipes[1]._id, quantity: 0.25, cost: 63.5 }
        ],
        totalCost: 1096,
        yield: { quantity: 8, uom: 'servings' },
        costPerServing: 137,
        menuPrice: 380,
        foodCostPercentage: 36.05, // High food cost - should appear in alerts
        prepTime: 50,
        cookTime: 90,
        difficulty: 'HARD',
        instructions: ['Marinate mutton', 'Slow cook with spices', 'Add yogurt', 'Simmer until tender'],
        locations: [locations[0]._id, locations[3]._id],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${mainRecipes.length} main recipes`);

    // 7. CREATE B2B CLIENTS
    const clients = await Client.insertMany([
      {
        businessName: 'TechCorp Cafeteria Services',
        taxId: 'GSTIN9876543210',
        contactPerson: { name: 'Rahul Mehta', email: 'rahul@techcorp.com', phone: '+91-98765-11111' },
        address: { street: '12 Tech Park', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' },
        pricingTier: 'GOLD',
        discountPercentage: 15,
        creditLimit: 500000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 45,
        totalRevenue: 1250000
      },
      {
        businessName: 'Event Masters Catering',
        taxId: 'GSTIN8765432109',
        contactPerson: { name: 'Sneha Kapoor', email: 'sneha@eventmasters.com', phone: '+91-98765-22222' },
        address: { street: '45 Event Plaza', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
        pricingTier: 'PLATINUM',
        discountPercentage: 20,
        creditLimit: 800000,
        paymentTerms: 'NET_15',
        status: 'ACTIVE',
        totalOrders: 78,
        totalRevenue: 2850000
      },
      {
        businessName: 'Hotel Grand Plaza',
        taxId: 'GSTIN7654321098',
        contactPerson: { name: 'Karthik Reddy', email: 'karthik@grandplaza.com', phone: '+91-98765-33333' },
        address: { street: '78 Beach Road', city: 'Goa', state: 'Goa', zipCode: '403001', country: 'India' },
        pricingTier: 'SILVER',
        discountPercentage: 10,
        creditLimit: 300000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 32,
        totalRevenue: 680000
      },
      {
        businessName: 'Corporate Meals Express',
        taxId: 'GSTIN6543210987',
        contactPerson: { name: 'Anita Deshmukh', email: 'anita@corporatemeals.com', phone: '+91-98765-44444' },
        address: { street: '90 Business District', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India' },
        pricingTier: 'GOLD',
        discountPercentage: 15,
        creditLimit: 450000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 56,
        totalRevenue: 1450000
      },
      {
        businessName: 'School Nutrition Services',
        taxId: 'GSTIN5432109876',
        contactPerson: { name: 'Ramesh Kumar', email: 'ramesh@schoolnutrition.com', phone: '+91-98765-55555' },
        address: { street: '23 Education Lane', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001', country: 'India' },
        pricingTier: 'STANDARD',
        discountPercentage: 5,
        creditLimit: 200000,
        paymentTerms: 'NET_60',
        status: 'ACTIVE',
        totalOrders: 89,
        totalRevenue: 950000
      },
      {
        businessName: 'Wedding Banquets Ltd',
        taxId: 'GSTIN4321098765',
        contactPerson: { name: 'Pooja Sharma', email: 'pooja@weddingbanquets.com', phone: '+91-98765-66666' },
        address: { street: '56 Marriage Hall Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001', country: 'India' },
        pricingTier: 'PLATINUM',
        discountPercentage: 18,
        creditLimit: 1000000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 24,
        totalRevenue: 3200000
      },
      {
        businessName: 'Quick Bite Restaurants',
        taxId: 'GSTIN3210987654',
        contactPerson: { name: 'Vijay Malhotra', email: 'vijay@quickbite.com', phone: '+91-98765-77777' },
        address: { street: '89 Food Street', city: 'Pune', state: 'Maharashtra', zipCode: '411001', country: 'India' },
        pricingTier: 'SILVER',
        discountPercentage: 12,
        creditLimit: 350000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 67,
        totalRevenue: 1100000
      },
      {
        businessName: 'Hospital Food Services',
        taxId: 'GSTIN2109876543',
        contactPerson: { name: 'Dr. Sunita Rao', email: 'sunita@hospitalfood.com', phone: '+91-98765-88888' },
        address: { street: '12 Medical Complex', city: 'Hyderabad', state: 'Telangana', zipCode: '500001', country: 'India' },
        pricingTier: 'GOLD',
        discountPercentage: 14,
        creditLimit: 600000,
        paymentTerms: 'NET_15',
        status: 'ACTIVE',
        totalOrders: 102,
        totalRevenue: 1850000
      },
      {
        businessName: 'Office Lunch Box',
        taxId: 'GSTIN1098765432',
        contactPerson: { name: 'Manish Gupta', email: 'manish@officelunchbox.com', phone: '+91-98765-99999' },
        address: { street: '34 Corporate Avenue', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301', country: 'India' },
        pricingTier: 'STANDARD',
        discountPercentage: 8,
        creditLimit: 250000,
        paymentTerms: 'NET_30',
        status: 'ACTIVE',
        totalOrders: 134,
        totalRevenue: 780000
      },
      {
        businessName: 'Gourmet Dining Club',
        taxId: 'GSTIN0987654321',
        contactPerson: { name: 'Nisha Agarwal', email: 'nisha@gourmetdining.com', phone: '+91-98765-00000' },
        address: { street: '67 Fine Dine Road', city: 'Kolkata', state: 'West Bengal', zipCode: '700001', country: 'India' },
        pricingTier: 'PLATINUM',
        discountPercentage: 22,
        creditLimit: 750000,
        paymentTerms: 'NET_15',
        status: 'ACTIVE',
        totalOrders: 41,
        totalRevenue: 2100000
      }
    ]);
    console.log(`✅ Created ${clients.length} B2B clients`);

    // 8. CREATE SALES DATA (6 months history for each location)
    const salesDataEntries = [];
    const today = new Date();
    
    for (let locationIndex = 0; locationIndex < locations.length; locationIndex++) {
      for (let daysAgo = 180; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const month = date.getMonth() + 1;
        
        // Base revenue with variations
        let baseRevenue = 50000 + Math.random() * 30000;
        if (isWeekend) baseRevenue *= 1.4;
        if (month === 12 || month === 1) baseRevenue *= 1.2; // Holiday season
        
        const totalOrders = Math.floor(baseRevenue / 250);
        const foodCost = baseRevenue * (0.28 + Math.random() * 0.08);
        const laborCost = baseRevenue * 0.25;
        const otherCosts = baseRevenue * 0.15;
        
        salesDataEntries.push({
          locationId: locations[locationIndex]._id,
          date,
          totalRevenue: Math.round(baseRevenue),
          totalOrders,
          guestCount: Math.floor(totalOrders * 2.5),
          foodCost: Math.round(foodCost),
          laborCost: Math.round(laborCost),
          otherCosts: Math.round(otherCosts),
          isWeekend,
          isHoliday: month === 12 && date.getDate() === 25
        });
      }
    }
    
    await SalesData.insertMany(salesDataEntries);
    console.log(`✅ Created ${salesDataEntries.length} sales data entries (6 months per location)`);

    // 9. CREATE INITIAL INVENTORY STOCK for all locations
    const inventoryStockEntries = [];
    for (const location of locations) {
      for (const ingredient of ingredients) {
        inventoryStockEntries.push({
          locationId: location._id,
          ingredientId: ingredient._id,
          currentStock: ingredient.reorderQuantity * 2, // Start with double reorder quantity
          uom: ingredient.baseUOM,
          reorderLevel: ingredient.reorderLevel,
          reorderQuantity: ingredient.reorderQuantity,
          averageCost: ingredient.currentPrice,
          lastRestocked: new Date()
        });
      }
    }
    
    await InventoryStock.insertMany(inventoryStockEntries);
    console.log(`✅ Created ${inventoryStockEntries.length} inventory stock entries`);

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   - ${locations.length} Locations`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${suppliers.length} Suppliers`);
    console.log(`   - ${ingredients.length} Ingredients`);
    console.log(`   - ${subRecipes.length} Sub-recipes`);
    console.log(`   - ${mainRecipes.length} Main Recipes`);
    console.log(`   - ${clients.length} B2B Clients`);
    console.log(`   - ${salesDataEntries.length} Sales Records`);
    console.log(`   - ${inventoryStockEntries.length} Inventory Records`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Super Admin: admin@skopeos.com / admin123');
    console.log('   Chef: chef@skopeos.com / chef123');
    console.log('   Manager: manager1@skopeos.com / manager123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
