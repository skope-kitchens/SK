import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  cuisineType: {
    type: String,
    enum: ['FAST_FOOD', 'ETHNIC', 'CONTINENTAL', 'ASIAN', 'FUSION', 'OTHER'],
    required: true
  },
  logo: String,
  colorPrimary: String,
  colorSecondary: String,
  // Financial Targets (per month)
  targetRevenue: {
    type: Number,
    default: 666667 // ~6.67L monthly for shared 20L/3 months
  },
  targetCOGS: {
    type: Number,
    default: 35 // 35%
  },
  targetAggregatorFees: {
    type: Number,
    default: 50 // 50% (includes marketing)
  },
  targetNetProfit: {
    type: Number,
    default: 15 // 15%
  },
  // CRM Settings
  crmIntegration: {
    googleMyBusiness: { type: Boolean, default: false },
    crmEnabled: { type: Boolean, default: false },
    crmProvider: String
  },
  // Loyalty Program
  loyaltySettings: {
    enabled: { type: Boolean, default: true },
    pointsPerRupee: { type: Number, default: 1 },
    redemptionRate: { type: Number, default: 100 } // 100 points = ₹1
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

export default mongoose.model('Brand', brandSchema);
