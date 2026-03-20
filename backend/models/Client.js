import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  taxId: {
    type: String,
    required: true,
    unique: true
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  pricingTier: {
    type: String,
    enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'],
    default: 'STANDARD'
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    default: 'NET_30' // NET_15, NET_30, NET_60, COD
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
    default: 'PENDING'
  },
  recurringOrders: [{
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    quantity: Number,
    frequency: String, // DAILY, WEEKLY, MONTHLY
    dayOfWeek: Number,
    dayOfMonth: Number
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Client', clientSchema);
