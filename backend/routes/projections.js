import express from 'express';
import FinancialRecord from '../models/FinancialRecord.js';
import mongoose from 'mongoose';

const router = express.Router();

// Sales Projection with 5%-15% growth band
router.get('/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Get last 3 months of data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const records = await FinancialRecord.find({
      brandId: new mongoose.Types.ObjectId(brandId),
      date: { $gte: threeMonthsAgo }
    }).sort({ date: 1 });
    
    if (records.length < 30) {
      return res.json({
        success: true,
        data: {
          message: 'Insufficient data for projection (need at least 30 days)',
          hasEnoughData: false
        }
      });
    }
    
    // Calculate monthly averages
    const monthlyData = {};
    records.forEach(r => {
      const monthKey = `${r.year}-${r.month}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, orders: 0, days: 0 };
      }
      monthlyData[monthKey].revenue += r.netRevenue;
      monthlyData[monthKey].orders += r.totalOrders;
      monthlyData[monthKey].days++;
    });
    
    const months = Object.keys(monthlyData).sort();
    const monthlyTotals = months.map(m => ({
      month: m,
      revenue: monthlyData[m].revenue,
      orders: monthlyData[m].orders,
      avgDaily: monthlyData[m].revenue / monthlyData[m].days
    }));
    
    // Calculate growth rates between months
    const growthRates = [];
    for (let i = 1; i < monthlyTotals.length; i++) {
      const prev = monthlyTotals[i - 1].revenue;
      const curr = monthlyTotals[i].revenue;
      if (prev > 0) {
        growthRates.push(((curr - prev) / prev) * 100);
      }
    }
    
    // Calculate average growth rate
    const avgGrowth = growthRates.length > 0 
      ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length 
      : 5;
    
    // Get last month's data
    const lastMonth = monthlyTotals[monthlyTotals.length - 1];
    
    // Calculate projections with 5%-15% growth band
    const conservativeGrowth = Math.max(5, Math.min(avgGrowth - 3, 10)); // Min 5%, capped at 10%
    const optimisticGrowth = Math.min(15, Math.max(avgGrowth + 3, 8)); // Max 15%, min 8%
    const projectedGrowth = Math.max(5, Math.min(avgGrowth, 15)); // Clamp to 5-15% band
    
    const projectedRevenue = {
      conservative: Math.round(lastMonth.revenue * (1 + conservativeGrowth / 100)),
      projected: Math.round(lastMonth.revenue * (1 + projectedGrowth / 100)),
      optimistic: Math.round(lastMonth.revenue * (1 + optimisticGrowth / 100))
    };
    
    const projectedOrders = {
      conservative: Math.round(lastMonth.orders * (1 + conservativeGrowth / 100)),
      projected: Math.round(lastMonth.orders * (1 + projectedGrowth / 100)),
      optimistic: Math.round(lastMonth.orders * (1 + optimisticGrowth / 100))
    };
    
    // Daily breakdown for current month projection
    const daysInMonth = 30;
    const dailyProjection = [];
    const today = new Date();
    
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base daily average with weekend multiplier
      const baseDaily = projectedRevenue.projected / daysInMonth;
      const multiplier = isWeekend ? 1.4 : 0.9;
      
      dailyProjection.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        isWeekend,
        conservative: Math.round(baseDaily * 0.9 * multiplier),
        projected: Math.round(baseDaily * multiplier),
        optimistic: Math.round(baseDaily * 1.1 * multiplier)
      });
    }
    
    res.json({
      success: true,
      data: {
        hasEnoughData: true,
        historicalData: monthlyTotals,
        growthAnalysis: {
          monthlyGrowthRates: growthRates.map(g => g.toFixed(1) + '%'),
          avgGrowthRate: avgGrowth.toFixed(1) + '%',
          growthBand: { min: '5%', max: '15%' },
          appliedGrowth: {
            conservative: conservativeGrowth.toFixed(1) + '%',
            projected: projectedGrowth.toFixed(1) + '%',
            optimistic: optimisticGrowth.toFixed(1) + '%'
          }
        },
        projections: {
          currentMonth: {
            revenue: projectedRevenue,
            orders: projectedOrders
          },
          dailyBreakdown: dailyProjection.slice(0, 14) // Next 2 weeks
        },
        insights: [
          avgGrowth > 10 
            ? '📈 Strong growth trend detected! Consider scaling operations.'
            : avgGrowth > 5 
              ? '📊 Steady growth. Focus on maintaining momentum.'
              : '⚠️ Growth below target. Review marketing and operations.',
          projectedRevenue.projected > 1000000 
            ? '🎯 On track to exceed ₹10L monthly target!'
            : `🔄 Gap of ₹${(1000000 - projectedRevenue.projected).toLocaleString()} to reach ₹10L target.`
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Comparison projection for all brands
router.get('/compare/all', async (req, res) => {
  try {
    const Brand = (await import('../models/Brand.js')).default;
    const brands = await Brand.find({ isActive: true });
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const projections = await Promise.all(brands.map(async (brand) => {
      const records = await FinancialRecord.find({
        brandId: brand._id,
        date: { $gte: threeMonthsAgo }
      });
      
      const totalRevenue = records.reduce((sum, r) => sum + r.netRevenue, 0);
      const avgMonthly = totalRevenue / 3;
      const projectedGrowth = 10; // Use middle of band for comparison
      
      return {
        brandId: brand._id,
        brandName: brand.name,
        brandCode: brand.code,
        color: brand.colorPrimary,
        lastThreeMonths: Math.round(totalRevenue),
        avgMonthly: Math.round(avgMonthly),
        projectedNextMonth: Math.round(avgMonthly * 1.10),
        targetRevenue: brand.targetRevenue,
        targetGap: Math.round(brand.targetRevenue - (avgMonthly * 1.10))
      };
    }));
    
    const grandTotal = projections.reduce((acc, p) => ({
      lastThreeMonths: acc.lastThreeMonths + p.lastThreeMonths,
      projectedNextMonth: acc.projectedNextMonth + p.projectedNextMonth
    }), { lastThreeMonths: 0, projectedNextMonth: 0 });
    
    res.json({
      success: true,
      data: {
        brands: projections,
        grandTotal: {
          lastThreeMonths: grandTotal.lastThreeMonths,
          projectedNextMonth: grandTotal.projectedNextMonth,
          targetThreeMonths: 2000000, // 20L
          progressPercentage: ((grandTotal.lastThreeMonths / 2000000) * 100).toFixed(1)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
