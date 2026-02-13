import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Cloud, Clock, Database, Trash2, Lock } from 'lucide-react'

export default function StoragePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </Link>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Secure Storage
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Encrypted data stored safely with automatic expiration
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-green-600" />
            Cloud Storage Security
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Your encrypted images are stored on Cloudinary, a leading cloud media management platform. 
            However, unlike regular cloud storage, your data is protected:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Encrypted at rest</strong> - Only encrypted blobs are stored, unreadable without the key</span>
            </li>
            <li className="flex items-start gap-3">
              <Database className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>No metadata exposure</strong> - Original filenames and content remain private</span>
            </li>
            <li className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Enterprise-grade infrastructure</strong> - 99.9% uptime with global CDN</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Automatic Expiration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Security doesn't just mean encryption - it also means not keeping data forever. 
            All uploaded images automatically expire after 72 hours (3 days).
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">72</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hours</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <Trash2 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">100%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auto-deleted</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <Lock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Retained keys</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              <strong>Why 72 hours?</strong> This provides enough time for the recipient to access the image 
              while minimizing the window of exposure. After expiration, the encrypted data is permanently 
              deleted from Cloudinary and our database.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What We Store (and Don't Store)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                What We Store
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Encrypted image blob (unreadable data)</li>
                <li>✓ Unique image ID</li>
                <li>✓ Upload timestamp</li>
                <li>✓ File size (for reference)</li>
                <li>✓ MIME type (to help with decryption)</li>
                <li>✓ Telegram ID (for notifications)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                What We NEVER Store
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✗ Decryption keys</li>
                <li>✗ Original image content</li>
                <li>✗ Unencrypted thumbnails</li>
                <li>✗ IP addresses</li>
                <li>✗ User tracking data</li>
                <li>✗ Analytics or logs</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Data Lifecycle
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Upload (Hour 0)</h3>
                <p className="text-gray-600 dark:text-gray-400">Encrypted image is stored on Cloudinary, metadata in MongoDB</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Available (Hours 0-72)</h3>
                <p className="text-gray-600 dark:text-gray-400">Image can be accessed with the decryption key at any time</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Expiration (Hour 72)</h3>
                <p className="text-gray-600 dark:text-gray-400">MongoDB TTL index automatically triggers deletion</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Complete Deletion</h3>
                <p className="text-gray-600 dark:text-gray-400">Encrypted data removed from Cloudinary and database - gone forever</p>
              </div>
            </div>
          </div>
        </section>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy Guarantee:</strong> Because we never store decryption keys and images auto-delete, 
            even if someone gains access to our database, they would only find encrypted data that 
            cannot be decrypted without your key.
          </p>
        </div>
      </div>
    </div>
  )
}
