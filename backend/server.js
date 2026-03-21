import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import locationRoutes from './routes/locations.js';
import ingredientRoutes from './routes/ingredients.js';
import recipeRoutes from './routes/recipes.js';
import clientRoutes from './routes/clients.js';
import orderRoutes from './routes/orders.js';
import inventoryRoutes from './routes/inventory.js';
import foodCostRoutes from './routes/foodCost.js';
import salesProjectionRoutes from './routes/salesProjection.js';
import dashboardRoutes from './routes/dashboard.js';
import supplierRoutes from './routes/suppliers.js';
import brandRoutes from './routes/brands.js';
import financeRoutes from './routes/finance.js';
import projectionsRoutes from './routes/projections.js';
import customerRoutes from './routes/customers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected - SkopeOS'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkopeOS Backend is running', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/food-cost', foodCostRoutes);
app.use('/api/sales-projection', salesProjectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/projections', projectionsRoutes);
app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SkopeOS Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
