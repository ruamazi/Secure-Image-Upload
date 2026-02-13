import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Crown,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BillingPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success/cancel messages from PayPal redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your subscription has been activated.');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payment/billing-info`, {
        withCredentials: true
      });
      setBillingInfo(response.data);
    } catch (err) {
      setError('Failed to load billing information');
      console.error('Billing info error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCancelling(true);
    try {
      await axios.post(`${API_URL}/api/payment/cancel-subscription`, {
        subscriptionId: billingInfo.subscription.paypalSubscriptionId
      }, {
        withCredentials: true
      });
      
      setSuccessMessage('Subscription cancelled successfully');
      await fetchBillingInfo();
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error('Cancel error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription and view payment history
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-blue-600" />
          Current Subscription
        </h2>

        {billingInfo?.subscription?.type === 'free' ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You're currently on the Free plan with {billingInfo?.uploadStats?.currentMonth || 0} uploads this month.
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Plan</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {billingInfo?.subscription?.type}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`font-semibold capitalize ${
                billingInfo?.subscription?.status === 'active' 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {billingInfo?.subscription?.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Renewal Date</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDate(billingInfo?.subscription?.expiresAt)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 dark:text-gray-400">Uploads This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {billingInfo?.uploadStats?.currentMonth || 0}
              </span>
            </div>

            {billingInfo?.subscription?.status === 'active' && (
              <div className="pt-4">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Cancel Subscription
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  You can continue using premium features until the end of your billing period
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Payment History
        </h2>

        {billingInfo?.paymentHistory?.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No payment history available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingInfo?.paymentHistory?.map((payment, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">
                      {payment.planType}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                      }`}>
                        {payment.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
