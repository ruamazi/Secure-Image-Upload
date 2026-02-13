import React from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowLeft, Shield, Key, EyeOff } from 'lucide-react'

export default function EncryptionPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </Link>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Client-Side Encryption
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your data never leaves your browser unencrypted
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            When you upload an image, it gets encrypted directly in your web browser using 
            military-grade AES-256-GCM encryption before being sent to our servers. This means:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <Key className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Only you possess the decryption key - we never store it</span>
            </li>
            <li className="flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Even if our servers were compromised, your images remain encrypted</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Cloud storage providers (Cloudinary) only see encrypted data</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Algorithm</h3>
              <p className="text-gray-600 dark:text-gray-400">AES-256-GCM with 256-bit keys</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Generation</h3>
              <p className="text-gray-600 dark:text-gray-400">Unique key per image using Web Crypto API</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">IV Size</h3>
              <p className="text-gray-600 dark:text-gray-400">96 bits (12 bytes) random initialization vector</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
              <p className="text-gray-600 dark:text-gray-400">GCM mode provides authenticated encryption</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            The Process
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Select Your Image</h3>
                <p className="text-gray-600 dark:text-gray-400">Choose any image from your device (JPG, PNG, GIF, etc.)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Key Generation</h3>
                <p className="text-gray-600 dark:text-gray-400">Your browser generates a unique 256-bit encryption key</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Encryption</h3>
                <p className="text-gray-600 dark:text-gray-400">The image is encrypted entirely in your browser using the generated key</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Upload</h3>
                <p className="text-gray-600 dark:text-gray-400">Only the encrypted data is uploaded to Cloudinary</p>
              </div>
            </div>
          </div>
        </section>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> The decryption key is displayed on screen and sent to your Telegram. 
            Save it securely - if lost, the image cannot be recovered!
          </p>
        </div>
      </div>
    </div>
  )
}
