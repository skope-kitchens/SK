import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'BAKERY', 'DRY_GOODS', 'SPICES', 'BEVERAGES', 'PACKAGING', 'EQUIPMENT', 'OTHER']
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
  email: String,
  phone: String,
  taxId: String,
  paymentTerms: {
    type: String,
    default: 'NET_30'
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  leadTime: {
    type: Number,
    default: 1 // days
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  products: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    },
    price: Number,
    uom: String,
    isPreferred: Boolean
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Supplier', supplierSchema);
