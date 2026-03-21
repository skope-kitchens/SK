import mongoose from 'mongoose';

const wasteLogSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  ingredientName: String,
  ingredientSku: String,
  category: {
    type: String,
    enum: ['PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'BAKERY', 'DRY_GOODS', 'SPICES', 'BEVERAGES', 'PACKAGING', 'OTHER'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  uom: {
    type: String,
    required: true
  },
  unitCost: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  wasteReason: {
    type: String,
    enum: ['EXPIRED', 'SPOILED', 'OVERPRODUCTION', 'PREP_WASTE', 'PLATE_WASTE', 'SPILLAGE', 'QUALITY_ISSUE', 'OTHER'],
    required: true
  },
  notes: String,
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loggedByName: String,
  date: {
    type: Date,
    default: Date.now
  },
  shift: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'],
    default: 'MORNING'
  },
  // For analytics
  dayOfWeek: Number,
  month: Number,
  year: Number,
  // Flag for recurring patterns
  isRecurring: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate derived fields
wasteLogSchema.pre('save', function(next) {
  const date = new Date(this.date);
  this.dayOfWeek = date.getDay();
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  this.totalCost = this.quantity * this.unitCost;
  next();
});

// Index for efficient queries
wasteLogSchema.index({ brandId: 1, date: -1 });
wasteLogSchema.index({ brandId: 1, category: 1 });
wasteLogSchema.index({ brandId: 1, ingredientId: 1 });

export default mongoose.model('WasteLog', wasteLogSchema);
