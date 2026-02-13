import { Client, Environment } from '@paypal/paypal-server-sdk';

// PayPal Client Configuration
const getPayPalClient = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: process.env.NODE_ENV === 'production' 
      ? Environment.Production 
      : Environment.Sandbox,
    logging: {
      logLevel: 'info',
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });
};

// Product and Plan configurations
const PLANS = {
  premium: {
    name: 'SecureImg Premium',
    description: 'Premium plan with 100 uploads per month',
    price: '9.00',
    currency: 'USD',
    billingCycle: 'MONTH',
    frequency: 1
  },
  enterprise: {
    name: 'SecureImg Enterprise',
    description: 'Enterprise plan with 1000 uploads per month',
    price: '49.00',
    currency: 'USD',
    billingCycle: 'MONTH',
    frequency: 1
  }
};

// Create PayPal order
export const createOrder = async (planType) => {
  try {
    const client = getPayPalClient();
    const plan = PLANS[planType];
    
    if (!plan) {
      throw new Error('Invalid plan type');
    }
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: plan.currency,
          value: plan.price
        },
        description: plan.description
      }]
    };
    
    const { body } = await client.orders.create({
      body: orderRequest
    });
    
    return body;
  } catch (error) {
    console.error('PayPal create order error:', error);
    throw error;
  }
};

// Capture PayPal order payment
export const captureOrder = async (orderId) => {
  try {
    const client = getPayPalClient();
    const { body } = await client.orders.capture({
      id: orderId
    });
    return body;
  } catch (error) {
    console.error('PayPal capture order error:', error);
    throw error;
  }
};

// Create PayPal subscription
export const createSubscription = async (planType) => {
  try {
    const client = getPayPalClient();
    const plan = PLANS[planType];
    
    // First, create a product
    const productRequest = {
      name: plan.name,
      description: plan.description,
      type: 'SERVICE',
      category: 'SOFTWARE'
    };
    
    const { body: product } = await client.products.create({
      body: productRequest
    });
    
    // Create a plan for the product
    const planRequest = {
      product_id: product.id,
      name: `${plan.name} Plan`,
      description: plan.description,
      billing_cycles: [{
        frequency: {
          interval_unit: plan.billingCycle,
          interval_count: plan.frequency
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: plan.price,
            currency_code: plan.currency
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    };
    
    const { body: billingPlan } = await client.plans.create({
      body: planRequest
    });
    
    // Create subscription
    const subscriptionRequest = {
      plan_id: billingPlan.id,
      application_context: {
        brand_name: 'SecureImg',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.FRONTEND_URL}/billing?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`
      }
    };
    
    const { body: subscription } = await client.subscriptions.create({
      body: subscriptionRequest
    });
    
    return {
      subscriptionId: subscription.id,
      approvalUrl: subscription.links.find(link => link.rel === 'approve').href
    };
  } catch (error) {
    console.error('PayPal create subscription error:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscription = async (subscriptionId) => {
  try {
    const client = getPayPalClient();
    const { body } = await client.subscriptions.get({
      id: subscriptionId
    });
    return body;
  } catch (error) {
    console.error('PayPal get subscription error:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId, reason = 'User requested') => {
  try {
    const client = getPayPalClient();
    await client.subscriptions.cancel({
      id: subscriptionId,
      body: {
        reason
      }
    });
    return { success: true };
  } catch (error) {
    console.error('PayPal cancel subscription error:', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyWebhookSignature = async (headers, body) => {
  try {
    const client = getPayPalClient();
    const { body: verification } = await client.webhooks.verifySignature({
      body: {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: body
      }
    });
    return verification.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
};

export { PLANS };
export default getPayPalClient;
