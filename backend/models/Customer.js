import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: {
    type: String,
    required: true
  },
  // Loyalty Program
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
    default: 'BRONZE'
  },
  // Order History
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  lastOrderDate: Date,
  // Feedback
  feedbackHistory: [{
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  // Preferences
  preferences: {
    favoriteItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    dietaryRestrictions: [String],
    spiceLevel: { type: String, enum: ['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT'] }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate tier based on total spent
customerSchema.pre('save', function(next) {
  if (this.totalSpent >= 50000) {
    this.tier = 'PLATINUM';
  } else if (this.totalSpent >= 25000) {
    this.tier = 'GOLD';
  } else if (this.totalSpent >= 10000) {
    this.tier = 'SILVER';
  } else {
    this.tier = 'BRONZE';
  }
  
  // Calculate average rating
  if (this.feedbackHistory && this.feedbackHistory.length > 0) {
    const totalRating = this.feedbackHistory.reduce((sum, f) => sum + f.rating, 0);
    this.averageRating = totalRating / this.feedbackHistory.length;
  }
  
  // Calculate average order value
  if (this.totalOrders > 0) {
    this.averageOrderValue = this.totalSpent / this.totalOrders;
  }
  
  next();
});

export default mongoose.model('Customer', customerSchema);
