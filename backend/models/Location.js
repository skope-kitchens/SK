import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['CENTRAL_KITCHEN', 'RESTAURANT', 'CATERING', 'WAREHOUSE', 'HUB'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    manager: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  capacity: {
    dailyOrders: Number,
    staffCount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Location', locationSchema);
