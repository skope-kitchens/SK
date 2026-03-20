import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['MAIN', 'SUB'],
    default: 'MAIN'
  },
  category: {
    type: String,
    enum: ['APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SAUCE', 'COMPONENT', 'OTHER'],
    default: 'OTHER'
  },
  brand: String,
  sopLink: String,
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    },
    quantity: {
      type: Number,
      required: true
    },
    uom: String,
    cost: Number // calculated at time of recipe creation/update
  }],
  subRecipes: [{
    subRecipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    quantity: Number,
    cost: Number
  }],
  yield: {
    quantity: Number,
    uom: String
  },
  prepTime: Number, // minutes
  cookTime: Number, // minutes
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD']
  },
  totalCost: {
    type: Number,
    default: 0
  },
  costPerServing: Number,
  menuPrice: Number,
  foodCostPercentage: Number,
  instructions: [String],
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Calculate total cost before saving
recipeSchema.pre('save', function(next) {
  if (this.ingredients && this.ingredients.length > 0) {
    this.totalCost = this.ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  }
  if (this.subRecipes && this.subRecipes.length > 0) {
    this.totalCost += this.subRecipes.reduce((sum, sub) => sum + (sub.cost || 0), 0);
  }
  
  // Calculate food cost percentage
  if (this.menuPrice && this.totalCost) {
    this.foodCostPercentage = (this.totalCost / this.menuPrice) * 100;
  }
  
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Recipe', recipeSchema);
