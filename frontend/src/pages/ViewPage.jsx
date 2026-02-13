import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Unlock, Eye, Download, AlertCircle, Loader2, Shield } from 'lucide-react'
import { importKey, decryptFile, arrayBufferToBlob } from '../utils/encryption'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ViewPage() {
  const { id } = useParams()
  const [keyInput, setKeyInput] = useState('')
  const [decrypting, setDecrypting] = useState(false)
  const [imageData, setImageData] = useState(null)
  const [error, setError] = useState(null)
  const [imageInfo, setImageInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImageInfo()
  }, [id])

  const fetchImageInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/image/${id}/info`)
      setImageInfo(response.data)
    } catch (err) {
      setError('Image not found or has expired')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = async () => {
    if (!keyInput.trim()) {
      setError('Please enter the decryption key')
      return
    }

    setDecrypting(true)
    setError(null)

    try {
      const key = await importKey(keyInput.trim())
      
      const response = await axios.get(`${API_URL}/api/image/${id}`, {
        responseType: 'arraybuffer'
      })

      const decryptedBuffer = await decryptFile(response.data, key)
      const blob = arrayBufferToBlob(decryptedBuffer, imageInfo?.mimeType || 'image/jpeg')
      const url = URL.createObjectURL(blob)
      
      setImageData({
        url,
        blob,
        mimeType: imageInfo?.mimeType || 'image/jpeg',
        originalName: imageInfo?.originalName || 'image'
      })
    } catch (err) {
      console.error('Decryption error:', err)
      setError('Invalid decryption key or corrupted data. Please check your key and try again.')
    } finally {
      setDecrypting(false)
    }
  }

  const handleDownload = () => {
    if (imageData) {
      const a = document.createElement('a')
      a.href = imageData.url
      a.download = imageData.originalName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Decrypt Image
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your decryption key to view the secure image
        </p>
      </div>

      {imageData ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Unlock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Successfully Decrypted
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your image is now ready to view
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-100 dark:bg-gray-700">
              <img 
                src={imageData.url} 
                alt="Decrypted" 
                className="w-full h-auto max-h-[600px] object-contain"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>
              <a
                href={imageData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Open
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Secure Content
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This image is encrypted with AES-256-GCM encryption
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Decryption Key
                </span>
              </label>
              <textarea
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your decryption key here..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleDecrypt}
              disabled={decrypting || !keyInput.trim()}
              className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                decrypting || !keyInput.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {decrypting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Decrypt & View Image
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Privacy Note:</strong> The decryption happens entirely in your browser. 
              The decryption key is never sent to our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}