import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
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
  transactionType: {
    type: String,
    enum: ['PURCHASE', 'USAGE', 'WASTE', 'ADJUSTMENT', 'TRANSFER', 'RETURN'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  uom: String,
  unitCost: Number,
  totalCost: Number,
  currentStock: Number,
  newStock: Number,
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  reason: String, // for waste or adjustments
  notes: String,
  batchNumber: String,
  expiryDate: Date,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total cost
inventoryTransactionSchema.pre('save', function(next) {
  if (this.quantity && this.unitCost) {
    this.totalCost = this.quantity * this.unitCost;
  }
  next();
});

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
