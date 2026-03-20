import express from 'express';
import SalesData from '../models/SalesData.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to calculate seasonality index
const calculateSeasonalityIndex = (historicalData, targetMonth) => {
  const monthlyAverages = {};
  let totalAverage = 0;
  
  historicalData.forEach(data => {
    const month = data.month;
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = [];
    }
    monthlyAverages[month].push(data.totalRevenue);
    totalAverage += data.totalRevenue;
  });
  
  totalAverage = totalAverage / historicalData.length;
  
  const targetMonthAverage = monthlyAverages[targetMonth]?.length > 0
    ? monthlyAverages[targetMonth].reduce((a, b) => a + b, 0) / monthlyAverages[targetMonth].length
    : totalAverage;
  
  return totalAverage > 0 ? targetMonthAverage / totalAverage : 1;
};

// @route   GET /api/sales-projection/forecast
// @desc    Generate sales forecast
// @access  Private
router.get('/forecast', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { locationId, targetDate, guestCount, specialEvent } = req.query;
    
    if (!locationId || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Location ID and target date are required'
      });
    }
    
    const target = new Date(targetDate);
    const targetMonth = target.getMonth() + 1;
    const targetDayOfWeek = target.getDay();
    const isWeekend = targetDayOfWeek === 0 || targetDayOfWeek === 6;
    
    // Get historical data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const historicalData = await SalesData.find({
      locationId,
      date: { $gte: sixMonthsAgo }
    });
    
    if (historicalData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient historical data for projection'
      });
    }
    
    // Calculate base average
    const totalRevenue = historicalData.reduce((sum, data) => sum + data.totalRevenue, 0);
    const averageDailyRevenue = totalRevenue / historicalData.length;
    
    // Calculate seasonality index
    const seasonalityIndex = calculateSeasonalityIndex(historicalData, targetMonth);
    
    // Weekend adjustment
    const weekendData = historicalData.filter(d => d.isWeekend);
    const weekdayData = historicalData.filter(d => !d.isWeekend);
    
    const weekendAverage = weekendData.length > 0 
      ? weekendData.reduce((sum, d) => sum + d.totalRevenue, 0) / weekendData.length
      : averageDailyRevenue;
    
    const weekdayAverage = weekdayData.length > 0
      ? weekdayData.reduce((sum, d) => sum + d.totalRevenue, 0) / weekdayData.length
      : averageDailyRevenue;
    
    const weekendMultiplier = averageDailyRevenue > 0 ? weekendAverage / averageDailyRevenue : 1;
    const weekdayMultiplier = averageDailyRevenue > 0 ? weekdayAverage / averageDailyRevenue : 1;
    
    const dayTypeMultiplier = isWeekend ? weekendMultiplier : weekdayMultiplier;
    
    // Special event adjustment
    const specialEventMultiplier = specialEvent ? 1.3 : 1; // 30% increase for special events
    
    // Guest count adjustment
    const avgGuestCount = historicalData.reduce((sum, d) => sum + (d.guestCount || 0), 0) / historicalData.length;
    const guestCountMultiplier = guestCount && avgGuestCount > 0 ? guestCount / avgGuestCount : 1;
    
    // Final projection formula: (Historical Avg × Seasonality Index × Day Type × Special Event × Guest Count)
    const projectedRevenue = averageDailyRevenue * seasonalityIndex * dayTypeMultiplier * specialEventMultiplier * guestCountMultiplier;
    
    // Calculate confidence interval (±15%)
    const confidenceRange = {
      low: projectedRevenue * 0.85,
      high: projectedRevenue * 1.15
    };
    
    // Estimate required prep
    const avgFoodCostPct = historicalData.reduce((sum, d) => sum + (d.foodCostPercentage || 30), 0) / historicalData.length;
    const estimatedFoodCost = projectedRevenue * (avgFoodCostPct / 100);
    
    // Estimate orders
    const avgOrderValue = historicalData.reduce((sum, d) => sum + (d.averageOrderValue || 0), 0) / historicalData.length;
    const estimatedOrders = avgOrderValue > 0 ? Math.round(projectedRevenue / avgOrderValue) : 0;
    
    res.json({
      success: true,
      data: {
        targetDate,
        locationId,
        projectedRevenue,
        confidenceRange,
        factors: {
          historicalAverage: averageDailyRevenue,
          seasonalityIndex,
          dayType: isWeekend ? 'Weekend' : 'Weekday',
          dayTypeMultiplier,
          specialEvent,
          specialEventMultiplier,
          guestCount,
          guestCountMultiplier
        },
        estimates: {
          foodCost: estimatedFoodCost,
          orders: estimatedOrders,
          guestCount: guestCount || avgGuestCount
        },
        recommendations: [
          `Prepare ingredients for approximately ${estimatedOrders} orders`,
          `Estimated food cost: ₹${estimatedFoodCost.toFixed(2)}`,
          isWeekend ? 'Weekend - expect higher volume' : 'Weekday - normal volume expected',
          specialEvent ? 'Special event - increase prep by 30%' : ''
        ].filter(Boolean)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/sales-projection/trends
// @desc    Get sales trends and patterns
// @access  Private
router.get('/trends', protect, authorize('SUPER_ADMIN', 'EXECUTIVE_CHEF'), async (req, res) => {
  try {
    const { locationId, period = 'month' } = req.query;
    
    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }
    
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const salesData = await SalesData.find({
      locationId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Calculate trends
    const dailyTrend = salesData.map(d => ({
      date: d.date,
      revenue: d.totalRevenue,
      orders: d.totalOrders,
      foodCostPercentage: d.foodCostPercentage,
      profitMargin: d.profitMargin
    }));
    
    // Day of week analysis
    const dayOfWeekAnalysis = {};
    salesData.forEach(d => {
      const day = d.dayOfWeek;
      if (!dayOfWeekAnalysis[day]) {
        dayOfWeekAnalysis[day] = { revenue: 0, count: 0 };
      }
      dayOfWeekAnalysis[day].revenue += d.totalRevenue;
      dayOfWeekAnalysis[day].count += 1;
    });
    
    const dayOfWeekTrend = Object.entries(dayOfWeekAnalysis).map(([day, data]) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      averageRevenue: data.revenue / data.count
    }));
    
    // Calculate growth rate
    const midpoint = Math.floor(salesData.length / 2);
    const firstHalf = salesData.slice(0, midpoint);
    const secondHalf = salesData.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.totalRevenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.totalRevenue, 0) / secondHalf.length;
    const growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        period,
        dailyTrend,
        dayOfWeekTrend,
        summary: {
          totalRevenue: salesData.reduce((sum, d) => sum + d.totalRevenue, 0),
          averageDailyRevenue: salesData.reduce((sum, d) => sum + d.totalRevenue, 0) / salesData.length,
          totalOrders: salesData.reduce((sum, d) => sum + d.totalOrders, 0),
          averageFoodCost: salesData.reduce((sum, d) => sum + (d.foodCostPercentage || 0), 0) / salesData.length,
          growthRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
