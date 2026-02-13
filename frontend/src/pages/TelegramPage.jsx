import React from 'react'
import { Link } from 'react-router-dom'
import { Send, ArrowLeft, MessageCircle, Shield, Smartphone, AlertTriangle } from 'lucide-react'

export default function TelegramPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </Link>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Telegram Delivery
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Decryption keys delivered securely via Telegram Bot
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Why Telegram?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We use Telegram to deliver decryption keys because it provides a secure, instant, 
            and reliable way to send sensitive information directly to you:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>End-to-end encryption</strong> - Telegram Secret Chats use client-side encryption</span>
            </li>
            <li className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Instant delivery</strong> - Keys arrive in seconds on all your devices</span>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>No spam filters</strong> - Unlike email, messages won't get lost in spam</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Cross-platform</strong> - Access on phone, desktop, or web</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Get Started
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Install Telegram</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Download Telegram from <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">telegram.org</a> or your app store
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Find Your Telegram ID</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search for <strong>@userinfobot</strong> in Telegram and start a chat. The bot will reply with your numeric ID (e.g., 123456789).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Start the Bot</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search for the app's bot in Telegram and click <strong>Start</strong>. This allows the bot to send you messages.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Upload & Receive</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your Telegram ID when uploading. You'll receive the decryption key instantly in Telegram.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What You'll Receive
          </h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-2">🔐 <strong>Secure Image Shared</strong></p>
            <p className="mb-2">Someone has shared an encrypted image with you!</p>
            <p className="mb-2">📎 <strong>View Image:</strong> https://yourdomain.com/view/abc-123</p>
            <p className="mb-2">🔑 <strong>Decryption Key:</strong></p>
            <p className="pl-4 bg-gray-100 dark:bg-gray-600 p-2 rounded">[Your long decryption key here]</p>
            <p className="mt-2 text-xs text-gray-500">⚠️ The image expires after 72 hours</p>
          </div>
        </section>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Critical:</strong> You must start a chat with the bot before uploading! 
              Telegram bots cannot initiate conversations. If you don't click "Start" first, 
              you won't receive the decryption key.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Troubleshooting
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">Not receiving messages?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Make sure you clicked "Start" on the bot and entered your correct Telegram ID.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">Wrong ID format?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">You need the numeric ID (123456789), not your username (@username).</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
