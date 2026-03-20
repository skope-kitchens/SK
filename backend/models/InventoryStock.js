import mongoose from 'mongoose';

const inventoryStockSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  uom: String,
  reorderLevel: Number,
  reorderQuantity: Number,
  averageCost: Number,
  totalValue: Number,
  lastRestocked: Date,
  lastUsed: Date,
  expiryDate: Date,
  batchNumber: String,
  status: {
    type: String,
    enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'],
    default: 'IN_STOCK'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for location + ingredient
inventoryStockSchema.index({ locationId: 1, ingredientId: 1 }, { unique: true });

// Calculate status and total value before saving
inventoryStockSchema.pre('save', function(next) {
  // Update status based on stock level
  if (this.currentStock <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.reorderLevel && this.currentStock <= this.reorderLevel) {
    this.status = 'LOW_STOCK';
  } else if (this.expiryDate) {
    const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) {
      this.status = 'EXPIRING_SOON';
    } else {
      this.status = 'IN_STOCK';
    }
  } else {
    this.status = 'IN_STOCK';
  }
  
  // Calculate total value
  if (this.currentStock && this.averageCost) {
    this.totalValue = this.currentStock * this.averageCost;
  }
  
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('InventoryStock', inventoryStockSchema);
