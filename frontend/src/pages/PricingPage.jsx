import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X, ArrowLeft, Sparkles, Zap, Building, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PayPalSubscribeButton from '../components/PayPalSubscribeButton'

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [processingPlan, setProcessingPlan] = useState(null)

  const plans = [
    {
      name: 'Free',
      icon: <Sparkles className="w-6 h-6" />,
      price: '$0',
      period: '/month',
      description: 'Perfect for occasional secure sharing',
      features: [
        { text: '5 uploads per month', included: true },
        { text: '72-hour expiration', included: true },
        { text: 'Client-side encryption', included: true },
        { text: 'Telegram delivery', included: true },
        { text: 'Max 10MB file size', included: true },
        { text: 'Email support', included: false },
        { text: 'Custom expiration', included: false },
        { text: 'API access', included: false },
      ],
      highlighted: false
    },
    {
      name: 'Premium',
      icon: <Zap className="w-6 h-6" />,
      price: '$9',
      period: '/month',
      description: 'For power users who need more',
      features: [
        { text: '100 uploads per month', included: true },
        { text: '7-day expiration option', included: true },
        { text: 'Client-side encryption', included: true },
        { text: 'Telegram delivery', included: true },
        { text: 'Max 50MB file size', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom expiration times', included: true },
        { text: 'API access', included: false },
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      icon: <Building className="w-6 h-6" />,
      price: '$49',
      period: '/month',
      description: 'For teams and businesses',
      features: [
        { text: '1000 uploads per month', included: true },
        { text: '30-day expiration option', included: true },
        { text: 'Client-side encryption', included: true },
        { text: 'Telegram delivery', included: true },
        { text: 'Max 100MB file size', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Custom expiration times', included: true },
        { text: 'Full API access', included: true },
      ],
      highlighted: false
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Start free and upgrade when you need more. No credit card required for free tier.
        </p>
      </div>

      {/* Current Usage Banner */}
      {user && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Current Plan: {user.subscription?.type?.charAt(0).toUpperCase() + user.subscription?.type?.slice(1)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user.remainingUploads} uploads remaining this month
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.uploadStats?.currentMonth || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">uploads used</p>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.remainingUploads}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">remaining</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((user.uploadStats?.currentMonth || 0) / (user.remainingUploads + (user.uploadStats?.currentMonth || 0))) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative rounded-2xl p-8 transition-all duration-300 ${
              plan.highlighted 
                ? 'bg-blue-600 text-white shadow-2xl scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                plan.highlighted ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className={`w-5 h-5 flex-shrink-0 ${
                      plan.highlighted ? 'text-green-300' : 'text-green-600'
                    }`} />
                  ) : (
                    <X className={`w-5 h-5 flex-shrink-0 ${
                      plan.highlighted ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  )}
                  <span className={!feature.included && !plan.highlighted ? 'text-gray-400' : ''}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {plan.name === 'Free' ? (
              <Link
                to={isAuthenticated ? '/' : '/auth'}
                className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-300 ${
                  plan.cta === 'Current Plan'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta === 'Current Plan' ? 'Current Plan' : (isAuthenticated ? 'Continue Free' : 'Get Started Free')}
              </Link>
            ) : plan.name === 'Premium' && user?.subscription?.type !== 'premium' && user?.subscription?.type !== 'enterprise' ? (
              <div className="space-y-3">
                {processingPlan === 'premium' && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
                {isAuthenticated ? (
                  <PayPalSubscribeButton
                    planType="premium"
                    onSuccess={() => {
                      setProcessingPlan(null)
                      navigate('/billing?success=true')
                    }}
                    onError={() => {
                      setProcessingPlan(null)
                    }}
                  />
                ) : (
                  <Link
                    to="/auth"
                    className="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                  >
                    Sign in to Subscribe
                  </Link>
                )}
              </div>
            ) : plan.name === 'Enterprise' && user?.subscription?.type !== 'enterprise' ? (
              <a
                href="mailto:sales@secureimg.com?subject=Enterprise Plan Inquiry"
                className="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
              >
                Contact Sales
              </a>
            ) : (
              <button
                disabled
                className="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-default"
              >
                Current Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What happens when I reach my upload limit?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You'll need to wait until next month or upgrade to a premium plan. Your existing images remain accessible.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I cancel my subscription anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can cancel anytime. You'll keep premium features until the end of your billing period.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, we offer a 30-day money-back guarantee if you're not satisfied with premium features.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We accept all major credit cards, PayPal, and cryptocurrency for premium plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
