import mongoose from 'mongoose';

const financialRecordSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  month: Number,
  year: Number,
  // Revenue
  grossRevenue: {
    type: Number,
    required: true
  },
  discounts: {
    type: Number,
    default: 0
  },
  netRevenue: Number,
  // Costs
  cogs: {
    type: Number,
    required: true
  },
  cogsPercentage: Number,
  aggregatorFees: {
    type: Number,
    default: 0
  },
  marketingFees: {
    type: Number,
    default: 0
  },
  totalFees: Number,
  feesPercentage: Number,
  laborCost: {
    type: Number,
    default: 0
  },
  overheadCost: {
    type: Number,
    default: 0
  },
  // P&L
  grossProfit: Number,
  grossProfitMargin: Number,
  operatingProfit: Number,
  operatingProfitMargin: Number,
  netProfit: Number,
  netProfitMargin: Number,
  // Status
  isProfitTarget: {
    type: Boolean,
    default: false
  },
  isCOGSOverTarget: {
    type: Boolean,
    default: false
  },
  // Metadata
  totalOrders: Number,
  averageOrderValue: Number,
  topSellingCategories: [{
    category: String,
    revenue: Number,
    percentage: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate all derived fields before saving
financialRecordSchema.pre('save', function(next) {
  const date = new Date(this.date);
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  
  // Net Revenue
  this.netRevenue = this.grossRevenue - (this.discounts || 0);
  
  // COGS Percentage
  if (this.netRevenue > 0) {
    this.cogsPercentage = (this.cogs / this.netRevenue) * 100;
  }
  
  // Total Fees
  this.totalFees = (this.aggregatorFees || 0) + (this.marketingFees || 0);
  if (this.netRevenue > 0) {
    this.feesPercentage = (this.totalFees / this.netRevenue) * 100;
  }
  
  // Gross Profit (Revenue - COGS)
  this.grossProfit = this.netRevenue - this.cogs;
  if (this.netRevenue > 0) {
    this.grossProfitMargin = (this.grossProfit / this.netRevenue) * 100;
  }
  
  // Operating Profit (Gross Profit - Fees - Labor)
  this.operatingProfit = this.grossProfit - this.totalFees - (this.laborCost || 0);
  if (this.netRevenue > 0) {
    this.operatingProfitMargin = (this.operatingProfit / this.netRevenue) * 100;
  }
  
  // Net Profit (Operating Profit - Overhead)
  this.netProfit = this.operatingProfit - (this.overheadCost || 0);
  if (this.netRevenue > 0) {
    this.netProfitMargin = (this.netProfit / this.netRevenue) * 100;
  }
  
  // Check targets (35% COGS, 15% profit)
  this.isCOGSOverTarget = this.cogsPercentage > 35;
  this.isProfitTarget = this.netProfitMargin >= 15;
  
  next();
});

export default mongoose.model('FinancialRecord', financialRecordSchema);
