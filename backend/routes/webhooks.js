import express from 'express';
import { verifyWebhookSignature } from '../services/paypal.js';
import User from '../models/User.js';

const router = express.Router();

// PayPal Webhook Handler
router.post('/paypal', async (req, res) => {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req.headers, req.body);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const eventType = req.body.event_type;
    const resource = req.body.resource;
    
    console.log(`[WEBHOOK] Received ${eventType}`);
    
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.CREATED': {
        const subscriptionId = resource.id;
        const planId = resource.plan_id;
        
        // Find user by subscription ID
        const user = await User.findOne({
          'subscription.paypalSubscriptionId': subscriptionId
        });
        
        if (user) {
          user.subscription.status = 'active';
          
          // Set expiration based on billing cycle
          const startTime = new Date(resource.start_time);
          const expiresAt = new Date(startTime);
          
          if (resource.billing_info && resource.billing_info.cycle_executions) {
            // Add one month from start
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          }
          
          user.subscription.expiresAt = expiresAt;
          await user.save();
          
          console.log(`[WEBHOOK] Subscription activated for user: ${user.email}`);
        }
        break;
      }
      
      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = resource.id;
        
        const user = await User.findOne({
          'subscription.paypalSubscriptionId': subscriptionId
        });
        
        if (user) {
          user.subscription.status = 'cancelled';
          await user.save();
          
          console.log(`[WEBHOOK] Subscription cancelled for user: ${user.email}`);
        }
        break;
      }
      
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id;
        
        const user = await User.findOne({
          'subscription.paypalSubscriptionId': subscriptionId
        });
        
        if (user) {
          user.subscription.status = 'suspended';
          await user.save();
          
          console.log(`[WEBHOOK] Subscription suspended for user: ${user.email}`);
        }
        break;
      }
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const subscriptionId = resource.id;
        
        const user = await User.findOne({
          'subscription.paypalSubscriptionId': subscriptionId
        });
        
        if (user) {
          user.subscription.status = 'past_due';
          await user.save();
          
          console.log(`[WEBHOOK] Payment failed for user: ${user.email}`);
        }
        break;
      }
      
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = resource.supplementary_purchase_units?.[0]?.payments?.captures?.[0]?.id;
        
        if (orderId) {
          const user = await User.findOne({
            'subscription.paypalOrderId': orderId
          });
          
          if (user) {
            // Add to payment history
            const amount = resource.amount;
            user.paymentHistory.push({
              orderId: orderId,
              amount: parseFloat(amount.value),
              currency: amount.currency_code,
              status: 'completed',
              planType: user.subscription.type,
              createdAt: new Date()
            });
            
            await user.save();
            console.log(`[WEBHOOK] Payment captured for user: ${user.email}`);
          }
        }
        break;
      }
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
    }
    
    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent PayPal from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

// Test webhook (for development)
router.post('/test', (req, res) => {
  console.log('[WEBHOOK TEST] Received:', req.body);
  res.json({ received: true, body: req.body });
});

export default router;
