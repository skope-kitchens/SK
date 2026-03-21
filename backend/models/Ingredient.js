import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'BAKERY', 'DRY_GOODS', 'SPICES', 'BEVERAGES', 'PACKAGING', 'OTHER'],
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  baseUOM: {
    type: String,
    enum: ['KG', 'GM', 'LB', 'OZ', 'L', 'ML', 'PC', 'CASE', 'BOX'],
    required: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceHistory: [{
    price: Number,
    date: Date,
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    }
  }],
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  reorderLevel: {
    type: Number,
    default: 0
  },
  reorderQuantity: {
    type: Number,
    default: 0
  },
  conversionFactors: [{
    fromUOM: String,
    toUOM: String,
    factor: Number
  }],
  shelfLife: {
    value: Number,
    unit: String // days, weeks, months
  },
  storageRequirements: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Ingredient', ingredientSchema);
