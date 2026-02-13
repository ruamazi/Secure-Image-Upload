import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PayPalSubscribeButton({ planType, onSuccess, onError }) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState(null);

  const createSubscription = async (data, actions) => {
    try {
      const response = await fetch(`${API_URL}/api/payment/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const orderData = await response.json();
      return orderData.subscriptionId;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
      throw err;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const response = await fetch(`${API_URL}/api/payment/activate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: data.subscriptionID,
          planType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate subscription');
      }

      const result = await response.json();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  const onCancel = () => {
    console.log('Subscription cancelled by user');
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <PayPalButtons
        createSubscription={createSubscription}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={(err) => {
          console.error('PayPal error:', err);
          setError('PayPal checkout failed. Please try again.');
          if (onError) onError(err);
        }}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'subscribe',
        }}
      />
    </div>
  );
}
