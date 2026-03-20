import mongoose from 'mongoose';

const salesDataSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: Number, // 0-6
  week: Number,
  month: Number,
  year: Number,
  totalRevenue: {
    type: Number,
    required: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  guestCount: {
    type: Number,
    default: 0
  },
  averageOrderValue: Number,
  topSellingItems: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    quantity: Number,
    revenue: Number
  }],
  foodCost: Number,
  foodCostPercentage: Number,
  laborCost: Number,
  otherCosts: Number,
  profit: Number,
  profitMargin: Number,
  weather: String, // SUNNY, RAINY, CLOUDY, etc.
  specialEvent: String, // holiday, festival, etc.
  isWeekend: Boolean,
  isHoliday: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate metrics before saving
salesDataSchema.pre('save', function(next) {
  if (this.totalRevenue && this.totalOrders) {
    this.averageOrderValue = this.totalRevenue / this.totalOrders;
  }
  
  if (this.foodCost && this.totalRevenue) {
    this.foodCostPercentage = (this.foodCost / this.totalRevenue) * 100;
  }
  
  if (this.totalRevenue && this.foodCost && this.laborCost && this.otherCosts) {
    this.profit = this.totalRevenue - (this.foodCost + this.laborCost + this.otherCosts);
    this.profitMargin = (this.profit / this.totalRevenue) * 100;
  }
  
  const date = new Date(this.date);
  this.dayOfWeek = date.getDay();
  this.week = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  this.isWeekend = this.dayOfWeek === 0 || this.dayOfWeek === 6;
  
  next();
});

export default mongoose.model('SalesData', salesDataSchema);
