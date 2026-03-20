import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  items: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: Number,
    totalPrice: Number,
    foodCost: Number
  }],
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  totalFoodCost: Number,
  foodCostPercentage: Number,
  deliveryDate: Date,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: String,
  inventoryDepleted: {
    type: Boolean,
    default: false
  },
  depletionDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate food cost percentage
  if (this.totalFoodCost && this.total) {
    this.foodCostPercentage = (this.totalFoodCost / this.total) * 100;
  }
  
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Order', orderSchema);
