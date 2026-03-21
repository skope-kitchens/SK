import express from 'express';
import Brand from '../models/Brand.js';
import FinancialRecord from '../models/FinancialRecord.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true });
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get brand summary (for dashboard)
router.get('/:id/summary', async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Get last 30 days of financial data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const financialData = await FinancialRecord.find({
      brandId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    // Calculate totals
    const totals = financialData.reduce((acc, record) => ({
      revenue: acc.revenue + record.netRevenue,
      cogs: acc.cogs + record.cogs,
      profit: acc.profit + record.netProfit,
      orders: acc.orders + record.totalOrders
    }), { revenue: 0, cogs: 0, profit: 0, orders: 0 });
    
    // Get customer count
    const customerCount = await Customer.countDocuments({ brandId, isActive: true });
    
    // Calculate averages
    const avgCOGS = totals.revenue > 0 ? (totals.cogs / totals.revenue) * 100 : 0;
    const avgProfit = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totals.revenue),
        totalCOGS: Math.round(totals.cogs),
        totalProfit: Math.round(totals.profit),
        totalOrders: totals.orders,
        avgCOGSPercentage: avgCOGS.toFixed(1),
        avgProfitMargin: avgProfit.toFixed(1),
        customerCount,
        isCOGSOverTarget: avgCOGS > 35,
        isProfitUnderTarget: avgProfit < 15
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update brand settings
router.put('/:id/settings', async (req, res) => {
  try {
    const { crmIntegration, loyaltySettings } = req.body;
    
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          crmIntegration,
          loyaltySettings
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
