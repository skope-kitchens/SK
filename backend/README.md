# SkopeOS Backend API

## Overview
Node.js + Express + MongoDB backend for SkopeOS Kitchen Management Platform

## ✅ Features Implemented

### Core Modules
- ✅ **Authentication & Authorization** (JWT with 5 user roles)
- ✅ **Multi-Location Management** (5 locations seeded)
- ✅ **Inventory Management** (Real-time tracking, low-stock alerts, waste logging)
- ✅ **Recipe Management** (Main & sub-recipes with cost calculations)
- ✅ **B2B Client Portal** (Registration, tiered pricing, recurring orders)
- ✅ **Order Processing** ("Golden Thread" - auto-deplete inventory)
- ✅ **Food Cost Calculator** (Theoretical vs Actual FC tracking)
- ✅ **Sales Projection Calculator** (Historical analysis + forecasting)
- ✅ **Executive Dashboard** (Analytics with high FC alerts)
- ✅ **Supplier Management**

### Database Collections
- users (4 users with different roles)
- locations (5 locations: Downtown, Airport, Seaside, Tech Park, Metro)
- suppliers (4 suppliers)
- ingredients (26 ingredients with prices)
- recipes (6 main + 2 sub-recipes)
- clients (10 B2B clients)
- orders
- inventory_stocks (130 stock records)
- inventory_transactions
- sales_data (905 records - 6 months history per location)
- alerts

## 🔑 Test Credentials

```
Super Admin: admin@skopeos.com / admin123
Executive Chef: chef@skopeos.com / chef123
Kitchen Manager: manager1@skopeos.com / manager123
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location (Admin only)
- `PUT /api/locations/:id` - Update location (Admin only)

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/:id` - Get single ingredient
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `PUT /api/ingredients/:id/price` - Update price

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/:id` - Update recipe
- `PUT /api/recipes/:id/recalculate-cost` - Recalculate cost

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (triggers inventory depletion)

### Inventory
- `GET /api/inventory` - Get inventory stock
- `GET /api/inventory/alerts` - Get low stock alerts
- `GET /api/inventory/transactions` - Get transactions
- `POST /api/inventory/restock` - Add stock
- `POST /api/inventory/waste` - Log waste
- `POST /api/inventory/adjust` - Manual adjustment

### Food Cost Calculator
- `GET /api/food-cost/recipe/:id` - Calculate detailed FC for recipe
- `GET /api/food-cost/comparison` - Theoretical vs Actual FC
- `GET /api/food-cost/high-cost-items` - Get high FC recipes

### Sales Projection
- `GET /api/sales-projection/forecast` - Generate forecast
- `GET /api/sales-projection/trends` - Get sales trends

### Dashboard
- `GET /api/dashboard/executive` - Executive Chef dashboard
- `GET /api/dashboard/kitchen-manager` - Kitchen Manager dashboard
- `GET /api/dashboard/client` - B2B Client dashboard
- `PUT /api/dashboard/alerts/:id/read` - Mark alert as read

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Register new client
- `PUT /api/clients/:id` - Update client
- `PUT /api/clients/:id/approve` - Approve client

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier

## 🔄 "Golden Thread" - Auto Inventory Depletion

When an order status is updated to 'CONFIRMED', the system automatically:
1. Depletes inventory for all ingredients in the ordered recipes
2. Creates inventory transactions
3. Updates stock status (LOW_STOCK, OUT_OF_STOCK)
4. Generates alerts for critical stock levels
5. Recalculates food cost percentage based on current prices

## 📊 Food Cost Calculation

### Formula:
```
Food Cost % = (Cost of Ingredients / Menu Price) × 100
```

### Features:
- Real-time cost calculation based on current ingredient prices
- Theoretical vs Actual food cost comparison
- High food cost alerts (threshold: 35%)
- Ingredient-level cost breakdown
- Sub-recipe cost tracking

## 📈 Sales Projection

### Formula:
```
Projected Revenue = Historical Avg × Seasonality Index × Day Type × Special Event × Guest Count
```

### Factors:
- Historical average (last 6 months)
- Seasonality index (monthly patterns)
- Weekend vs weekday multiplier
- Special event adjustment (+30%)
- Guest count prediction

## 🚀 Running the Backend

```bash
cd /app/backend
node server.js
```

Or using supervisor:
```bash
sudo supervisorctl restart skopeos-backend
sudo supervisorctl status
```

## 🌱 Seeding Database

```bash
cd /app/backend
node scripts/seed.js
```

## 📝 Environment Variables

```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/skopeos
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🎯 Next Steps

1. ✅ Backend API - COMPLETE
2. ⏳ Enhance Web Dashboard
3. ⏳ Build React Native Mobile App (Expo)
4. ⏳ Testing & Integration
