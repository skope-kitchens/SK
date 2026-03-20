import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LOW_STOCK', 'HIGH_FOOD_COST', 'EXPIRING_SOON', 'WASTE_ALERT', 'ORDER_PENDING', 'SYSTEM'],
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  actionRequired: Boolean,
  actionTaken: Boolean,
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Alert', alertSchema);
