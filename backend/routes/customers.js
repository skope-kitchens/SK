import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all customers for a brand
router.get('/brand/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const { tier, sort = 'totalSpent' } = req.query;
    
    const query = { brandId, isActive: true };
    if (tier) query.tier = tier;
    
    const customers = await Customer.find(query)
      .sort({ [sort]: -1 })
      .limit(50);
    
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer stats for dashboard
router.get('/stats/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    
    const stats = await Customer.aggregate([
      { $match: { brandId: new (await import('mongoose')).default.Types.ObjectId(brandId), isActive: true } },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          totalOrders: { $sum: '$totalOrders' },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);
    
    const totalCustomers = await Customer.countDocuments({ brandId, isActive: true });
    const totalLoyaltyPoints = await Customer.aggregate([
      { $match: { brandId: new (await import('mongoose')).default.Types.ObjectId(brandId) } },
      { $group: { _id: null, total: { $sum: '$loyaltyPoints' } } }
    ]);
    
    // Get recent feedback
    const recentFeedback = await Customer.aggregate([
      { $match: { brandId: new (await import('mongoose')).default.Types.ObjectId(brandId) } },
      { $unwind: '$feedbackHistory' },
      { $sort: { 'feedbackHistory.date': -1 } },
      { $limit: 10 },
      {
        $project: {
          customerName: '$name',
          rating: '$feedbackHistory.rating',
          comment: '$feedbackHistory.comment',
          date: '$feedbackHistory.date'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalLoyaltyPoints: totalLoyaltyPoints[0]?.total || 0,
          tierBreakdown: stats
        },
        recentFeedback
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add feedback for a customer
router.post('/:customerId/feedback', async (req, res) => {
  try {
    const { rating, comment, orderId } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      {
        $push: {
          feedbackHistory: { rating, comment, orderId, date: new Date() }
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update loyalty points
router.post('/:customerId/loyalty', async (req, res) => {
  try {
    const { points, action } = req.body; // action: 'earn' or 'redeem'
    
    const update = action === 'earn' 
      ? { 
          $inc: { 
            loyaltyPoints: points, 
            totalPointsEarned: points 
          } 
        }
      : { 
          $inc: { 
            loyaltyPoints: -points, 
            totalPointsRedeemed: points 
          } 
        };
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      update,
      { new: true }
    );
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
