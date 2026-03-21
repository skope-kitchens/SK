import express from 'express';
import FinancialRecord from '../models/FinancialRecord.js';
import Brand from '../models/Brand.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// Get P&L Summary for a brand (last N days)
router.get('/pnl/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = await FinancialRecord.find({
      brandId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Calculate aggregated P&L
    const summary = records.reduce((acc, r) => ({
      grossRevenue: acc.grossRevenue + r.grossRevenue,
      discounts: acc.discounts + r.discounts,
      netRevenue: acc.netRevenue + r.netRevenue,
      cogs: acc.cogs + r.cogs,
      aggregatorFees: acc.aggregatorFees + r.aggregatorFees,
      marketingFees: acc.marketingFees + r.marketingFees,
      laborCost: acc.laborCost + r.laborCost,
      overheadCost: acc.overheadCost + r.overheadCost,
      grossProfit: acc.grossProfit + r.grossProfit,
      operatingProfit: acc.operatingProfit + r.operatingProfit,
      netProfit: acc.netProfit + r.netProfit,
      totalOrders: acc.totalOrders + r.totalOrders
    }), {
      grossRevenue: 0, discounts: 0, netRevenue: 0, cogs: 0,
      aggregatorFees: 0, marketingFees: 0, laborCost: 0, overheadCost: 0,
      grossProfit: 0, operatingProfit: 0, netProfit: 0, totalOrders: 0
    });
    
    // Calculate percentages
    const percentages = {
      cogsPercentage: summary.netRevenue > 0 ? (summary.cogs / summary.netRevenue) * 100 : 0,
      feesPercentage: summary.netRevenue > 0 ? ((summary.aggregatorFees + summary.marketingFees) / summary.netRevenue) * 100 : 0,
      grossProfitMargin: summary.netRevenue > 0 ? (summary.grossProfit / summary.netRevenue) * 100 : 0,
      operatingProfitMargin: summary.netRevenue > 0 ? (summary.operatingProfit / summary.netRevenue) * 100 : 0,
      netProfitMargin: summary.netRevenue > 0 ? (summary.netProfit / summary.netRevenue) * 100 : 0
    };
    
    // Target comparison (35% COGS, 50% Fees, 15% Net Profit)
    const targets = {
      cogsTarget: 35,
      feesTarget: 50,
      profitTarget: 15,
      isCOGSOverTarget: percentages.cogsPercentage > 35,
      isFeesOverTarget: percentages.feesPercentage > 50,
      isProfitUnderTarget: percentages.netProfitMargin < 15
    };
    
    res.json({
      success: true,
      data: {
        period: { days, startDate, endDate: new Date() },
        summary: {
          ...summary,
          grossRevenue: Math.round(summary.grossRevenue),
          netRevenue: Math.round(summary.netRevenue),
          cogs: Math.round(summary.cogs),
          aggregatorFees: Math.round(summary.aggregatorFees),
          marketingFees: Math.round(summary.marketingFees),
          laborCost: Math.round(summary.laborCost),
          overheadCost: Math.round(summary.overheadCost),
          grossProfit: Math.round(summary.grossProfit),
          operatingProfit: Math.round(summary.operatingProfit),
          netProfit: Math.round(summary.netProfit)
        },
        percentages: {
          cogsPercentage: percentages.cogsPercentage.toFixed(1),
          feesPercentage: percentages.feesPercentage.toFixed(1),
          grossProfitMargin: percentages.grossProfitMargin.toFixed(1),
          operatingProfitMargin: percentages.operatingProfitMargin.toFixed(1),
          netProfitMargin: percentages.netProfitMargin.toFixed(1)
        },
        targets,
        dailyData: records.map(r => ({
          date: r.date,
          revenue: r.netRevenue,
          cogs: r.cogs,
          profit: r.netProfit,
          orders: r.totalOrders
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly breakdown for charts
router.get('/monthly/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const months = parseInt(req.query.months) || 3;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const records = await FinancialRecord.aggregate([
      {
        $match: {
          brandId: new (await import('mongoose')).default.Types.ObjectId(brandId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          grossRevenue: { $sum: '$grossRevenue' },
          netRevenue: { $sum: '$netRevenue' },
          cogs: { $sum: '$cogs' },
          fees: { $sum: { $add: ['$aggregatorFees', '$marketingFees'] } },
          netProfit: { $sum: '$netProfit' },
          totalOrders: { $sum: '$totalOrders' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = records.map(r => ({
      month: monthNames[r._id.month - 1],
      year: r._id.year,
      revenue: Math.round(r.netRevenue),
      cogs: Math.round(r.cogs),
      fees: Math.round(r.fees),
      profit: Math.round(r.netProfit),
      orders: r.totalOrders,
      cogsPercentage: r.netRevenue > 0 ? ((r.cogs / r.netRevenue) * 100).toFixed(1) : 0,
      profitMargin: r.netRevenue > 0 ? ((r.netProfit / r.netRevenue) * 100).toFixed(1) : 0
    }));
    
    res.json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Food Cost Calculator - Get high cost items
router.get('/food-cost/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Get all recipes for this brand
    const recipes = await Recipe.find({ brandId, isActive: true })
      .select('name code menuPrice totalCost costPerServing foodCostPercentage category')
      .sort({ foodCostPercentage: -1 });
    
    // Categorize by food cost percentage
    const highCost = recipes.filter(r => r.foodCostPercentage > 40);
    const mediumCost = recipes.filter(r => r.foodCostPercentage > 30 && r.foodCostPercentage <= 40);
    const goodCost = recipes.filter(r => r.foodCostPercentage <= 30);
    
    // Calculate overall stats
    const totalRecipes = recipes.length;
    const avgFoodCost = recipes.length > 0 
      ? recipes.reduce((sum, r) => sum + r.foodCostPercentage, 0) / recipes.length 
      : 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalRecipes,
          avgFoodCost: avgFoodCost.toFixed(1),
          highCostCount: highCost.length,
          targetFoodCost: 35
        },
        highCostItems: highCost.map(r => ({
          name: r.name,
          code: r.code,
          category: r.category,
          menuPrice: r.menuPrice,
          cost: r.totalCost,
          foodCostPercentage: r.foodCostPercentage.toFixed(1),
          variance: (r.foodCostPercentage - 35).toFixed(1)
        })),
        mediumCostItems: mediumCost.map(r => ({
          name: r.name,
          menuPrice: r.menuPrice,
          foodCostPercentage: r.foodCostPercentage.toFixed(1)
        })),
        goodCostItems: goodCost.map(r => ({
          name: r.name,
          menuPrice: r.menuPrice,
          foodCostPercentage: r.foodCostPercentage.toFixed(1)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Aggregated P&L for all brands (Super Admin view)
router.get('/pnl-all', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const brands = await Brand.find({ isActive: true });
    
    const brandSummaries = await Promise.all(brands.map(async (brand) => {
      const records = await FinancialRecord.find({
        brandId: brand._id,
        date: { $gte: startDate }
      });
      
      const totals = records.reduce((acc, r) => ({
        revenue: acc.revenue + r.netRevenue,
        cogs: acc.cogs + r.cogs,
        profit: acc.profit + r.netProfit,
        orders: acc.orders + r.totalOrders
      }), { revenue: 0, cogs: 0, profit: 0, orders: 0 });
      
      return {
        brandId: brand._id,
        brandName: brand.name,
        brandCode: brand.code,
        color: brand.colorPrimary,
        revenue: Math.round(totals.revenue),
        cogs: Math.round(totals.cogs),
        profit: Math.round(totals.profit),
        orders: totals.orders,
        cogsPercentage: totals.revenue > 0 ? ((totals.cogs / totals.revenue) * 100).toFixed(1) : 0,
        profitMargin: totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0
      };
    }));
    
    // Calculate grand totals
    const grandTotal = brandSummaries.reduce((acc, b) => ({
      revenue: acc.revenue + b.revenue,
      cogs: acc.cogs + b.cogs,
      profit: acc.profit + b.profit,
      orders: acc.orders + b.orders
    }), { revenue: 0, cogs: 0, profit: 0, orders: 0 });
    
    res.json({
      success: true,
      data: {
        brands: brandSummaries,
        grandTotal: {
          ...grandTotal,
          cogsPercentage: grandTotal.revenue > 0 ? ((grandTotal.cogs / grandTotal.revenue) * 100).toFixed(1) : 0,
          profitMargin: grandTotal.revenue > 0 ? ((grandTotal.profit / grandTotal.revenue) * 100).toFixed(1) : 0
        },
        targets: {
          totalRevenueTarget: 2000000, // 20L for 3 months = ~666k per month
          cogsTarget: 35,
          profitTarget: 15
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
