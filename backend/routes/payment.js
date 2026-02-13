import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  createOrder, 
  captureOrder, 
  createSubscription, 
  getSubscription,
  cancelSubscription,
  PLANS 
} from '../services/paypal.js';
import User from '../models/User.js';

const router = express.Router();

// Create PayPal order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { planType } = req.body;
    
    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }
    
    const order = await createOrder(planType);
    
    // Store order ID temporarily in user record
    req.user.subscription.paypalOrderId = order.id;
    await req.user.save();
    
    res.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve')?.href
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

// Capture PayPal payment
router.post('/capture-order', authMiddleware, async (req, res) => {
  try {
    const { orderId, planType } = req.body;
    
    if (!orderId || !planType) {
      return res.status(400).json({ error: 'Order ID and plan type required' });
    }
    
    // Verify the order belongs to this user
    if (req.user.subscription.paypalOrderId !== orderId) {
      return res.status(403).json({ error: 'Invalid order ID' });
    }
    
    // Capture the payment
    const capture = await captureOrder(orderId);
    
    if (capture.status === 'COMPLETED') {
      // Update user subscription
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      req.user.subscription.type = planType;
      req.user.subscription.status = 'active';
      req.user.subscription.expiresAt = expiresAt;
      req.user.subscription.paypalOrderId = orderId;
      
      // Add to payment history
      const amount = capture.purchase_units[0].payments.captures[0].amount;
      req.user.paymentHistory.push({
        orderId: orderId,
        amount: parseFloat(amount.value),
        currency: amount.currency_code,
        status: 'completed',
        planType: planType
      });
      
      await req.user.save();
      
      res.json({
        success: true,
        message: 'Payment successful',
        subscription: req.user.subscription,
        capture: {
          id: capture.id,
          status: capture.status,
          amount: amount.value,
          currency: amount.currency_code
        }
      });
    } else {
      res.status(400).json({ 
        error: 'Payment not completed',
        status: capture.status 
      });
    }
  } catch (error) {
    console.error('Capture order error:', error);
    res.status(500).json({ 
      error: 'Failed to capture payment',
      details: error.message 
    });
  }
});

// Create PayPal subscription
router.post('/create-subscription', authMiddleware, async (req, res) => {
  try {
    const { planType } = req.body;
    
    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }
    
    const subscription = await createSubscription(planType);
    
    // Store subscription ID
    req.user.subscription.paypalSubscriptionId = subscription.subscriptionId;
    await req.user.save();
    
    res.json({
      success: true,
      subscriptionId: subscription.subscriptionId,
      approvalUrl: subscription.approvalUrl
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
});

// Verify and activate subscription
router.post('/activate-subscription', authMiddleware, async (req, res) => {
  try {
    const { subscriptionId, planType } = req.body;
    
    if (!subscriptionId || !planType) {
      return res.status(400).json({ error: 'Subscription ID and plan type required' });
    }
    
    // Verify the subscription belongs to this user
    if (req.user.subscription.paypalSubscriptionId !== subscriptionId) {
      return res.status(403).json({ error: 'Invalid subscription ID' });
    }
    
    // Get subscription details from PayPal
    const subscriptionDetails = await getSubscription(subscriptionId);
    
    if (subscriptionDetails.status === 'ACTIVE' || subscriptionDetails.status === 'APPROVED') {
      // Calculate expiration date
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      // Update user subscription
      req.user.subscription.type = planType;
      req.user.subscription.status = 'active';
      req.user.subscription.expiresAt = expiresAt;
      
      // Add to payment history
      const plan = PLANS[planType];
      req.user.paymentHistory.push({
        subscriptionId: subscriptionId,
        amount: parseFloat(plan.price),
        currency: plan.currency,
        status: 'completed',
        planType: planType
      });
      
      await req.user.save();
      
      res.json({
        success: true,
        message: 'Subscription activated successfully',
        subscription: {
          type: req.user.subscription.type,
          status: req.user.subscription.status,
          expiresAt: req.user.subscription.expiresAt
        }
      });
    } else {
      res.status(400).json({
        error: 'Subscription not active',
        status: subscriptionDetails.status
      });
    }
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({
      error: 'Failed to activate subscription',
      details: error.message
    });
  }
});

// Get billing info
router.get('/billing-info', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      subscription: user.subscription,
      paymentHistory: user.paymentHistory.slice(-10).reverse(), // Last 10 payments
      uploadStats: user.uploadStats
    });
  } catch (error) {
    console.error('Get billing info error:', error);
    res.status(500).json({ error: 'Failed to get billing info' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID required' });
    }
    
    // Verify the subscription belongs to this user
    if (req.user.subscription.paypalSubscriptionId !== subscriptionId) {
      return res.status(403).json({ error: 'Invalid subscription ID' });
    }
    
    // Cancel in PayPal
    await cancelSubscription(subscriptionId, 'User requested cancellation');
    
    // Update user
    req.user.subscription.status = 'cancelled';
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      details: error.message
    });
  }
});

export default router;
