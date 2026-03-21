import express from 'express';
import WasteLog from '../models/WasteLog.js';
import Ingredient from '../models/Ingredient.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get waste logs for a brand with filters
router.get('/brand/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const { days = 30, category, reason } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const query = {
      brandId: new mongoose.Types.ObjectId(brandId),
      date: { $gte: startDate }
    };
    
    if (category) query.category = category;
    if (reason) query.wasteReason = reason;
    
    const logs = await WasteLog.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get waste analytics/summary
router.get('/analytics/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Aggregate by category
    const byCategory = await WasteLog.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);
    
    // Aggregate by reason
    const byReason = await WasteLog.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$wasteReason',
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);
    
    // Top wasted ingredients
    const topWastedIngredients = await WasteLog.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$ingredientId',
          ingredientName: { $first: '$ingredientName' },
          ingredientSku: { $first: '$ingredientSku' },
          category: { $first: '$category' },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 },
          uom: { $first: '$uom' }
        }
      },
      { $sort: { totalCost: -1 } },
      { $limit: 10 }
    ]);
    
    // Daily trend
    const dailyTrend = await WasteLog.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate totals
    const totals = await WasteLog.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$totalCost' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);
    
    // Identify patterns (ingredients wasted more than 3 times)
    const patterns = topWastedIngredients
      .filter(item => item.count >= 3)
      .map(item => ({
        ingredient: item.ingredientName,
        frequency: item.count,
        totalCost: item.totalCost,
        suggestion: item.category === 'SEAFOOD' || item.category === 'PRODUCE' 
          ? 'Consider reducing order quantity or increasing order frequency'
          : item.category === 'MEAT' 
            ? 'Review portion sizes and storage conditions'
            : 'Monitor expiry dates more closely'
      }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalWasteCost: totals[0]?.totalCost || 0,
          totalEntries: totals[0]?.totalEntries || 0,
          avgDailyCost: totals[0] ? Math.round(totals[0].totalCost / days) : 0
        },
        byCategory,
        byReason,
        topWastedIngredients,
        dailyTrend,
        patterns,
        insights: generateInsights(byCategory, byReason, patterns)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate AI-like insights
function generateInsights(byCategory, byReason, patterns) {
  const insights = [];
  
  // Category insights
  if (byCategory.length > 0) {
    const topCategory = byCategory[0];
    insights.push({
      type: 'warning',
      title: `High ${topCategory._id} Waste`,
      message: `${topCategory._id} accounts for ₹${topCategory.totalCost.toLocaleString()} in waste. Consider reviewing storage and handling procedures.`
    });
  }
  
  // Reason insights
  const expiredWaste = byReason.find(r => r._id === 'EXPIRED');
  if (expiredWaste && expiredWaste.count > 5) {
    insights.push({
      type: 'alert',
      title: 'Expiry Management Issue',
      message: `${expiredWaste.count} items expired in this period. Implement FIFO inventory rotation.`
    });
  }
  
  const overproduction = byReason.find(r => r._id === 'OVERPRODUCTION');
  if (overproduction && overproduction.totalCost > 5000) {
    insights.push({
      type: 'info',
      title: 'Overproduction Detected',
      message: `₹${overproduction.totalCost.toLocaleString()} lost to overproduction. Review demand forecasting.`
    });
  }
  
  // Pattern insights
  if (patterns.length > 0) {
    insights.push({
      type: 'pattern',
      title: 'Recurring Waste Pattern',
      message: `${patterns[0].ingredient} has been wasted ${patterns[0].frequency} times. ${patterns[0].suggestion}`
    });
  }
  
  return insights;
}

// Log new waste entry
router.post('/', async (req, res) => {
  try {
    const { 
      brandId, ingredientId, quantity, wasteReason, 
      notes, loggedBy, loggedByName, shift 
    } = req.body;
    
    // Get ingredient details
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    
    const wasteLog = new WasteLog({
      brandId,
      ingredientId,
      ingredientName: ingredient.name,
      ingredientSku: ingredient.sku,
      category: ingredient.category,
      quantity,
      uom: ingredient.baseUOM,
      unitCost: ingredient.currentPrice,
      totalCost: quantity * ingredient.currentPrice,
      wasteReason,
      notes,
      loggedBy,
      loggedByName,
      shift
    });
    
    await wasteLog.save();
    
    res.status(201).json({ success: true, data: wasteLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk log waste (for batch entries)
router.post('/bulk', async (req, res) => {
  try {
    const { entries } = req.body;
    
    const logs = await Promise.all(entries.map(async (entry) => {
      const ingredient = await Ingredient.findById(entry.ingredientId);
      if (!ingredient) return null;
      
      return new WasteLog({
        ...entry,
        ingredientName: ingredient.name,
        ingredientSku: ingredient.sku,
        category: ingredient.category,
        uom: ingredient.baseUOM,
        unitCost: ingredient.currentPrice,
        totalCost: entry.quantity * ingredient.currentPrice
      });
    }));
    
    const validLogs = logs.filter(l => l !== null);
    await WasteLog.insertMany(validLogs);
    
    res.status(201).json({ success: true, data: validLogs, count: validLogs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete waste entry
router.delete('/:id', async (req, res) => {
  try {
    await WasteLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Waste log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
