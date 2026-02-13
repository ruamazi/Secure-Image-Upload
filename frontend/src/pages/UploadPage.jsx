import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Lock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { generateKey, exportKey, encryptFile } from '../utils/encryption'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [telegramId, setTelegramId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile)
      setUploadStatus(null)
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid image file' })
    }
  }

  const handleUpload = async () => {
    if (!file || !telegramId) {
      setUploadStatus({ type: 'error', message: 'Please select an image and enter your Telegram ID' })
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      setProgress(20)
      const key = await generateKey()
      const keyString = await exportKey(key)
      
      setProgress(40)
      const encryptedData = await encryptFile(file, key)
      
      setProgress(60)
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' })
      const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`, { type: 'application/octet-stream' })

      const formData = new FormData()
      formData.append('image', encryptedFile)
      formData.append('telegramId', telegramId)
      formData.append('originalName', file.name)
      formData.append('mimeType', file.type)

      setProgress(80)
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setProgress(90)
      
      await axios.post(`${API_URL}/api/notify`, {
        telegramId,
        imageId: response.data.imageId,
        decryptionKey: keyString
      })

      setProgress(100)
      setUploadStatus({
        type: 'success',
        message: 'Image uploaded successfully! Check your Telegram for the decryption key.',
        imageId: response.data.imageId,
        decryptionKey: keyString
      })
      setFile(null)
      setTelegramId('')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ type: 'error', message: error.response?.data?.error || 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Secure Image Upload
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your images are encrypted before they leave your browser. 
          Even we can't see your content.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            file 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto animate-float">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium text-lg">
                Click to select an image
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                or drag and drop here
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Your Telegram ID
              </span>
            </label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="Enter your Telegram numeric ID"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              We'll send you the decryption key via Telegram Bot
            </p>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Encrypting and uploading...</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || !telegramId || uploading}
            className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              !file || !telegramId || uploading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Encrypt & Upload
              </>
            )}
          </button>
        </div>

        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  uploadStatus.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {uploadStatus.message}
                </p>
                {uploadStatus.type === 'success' && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Save this decryption key (also sent to Telegram):</p>
                    <code className="text-xs break-all text-blue-600 dark:text-blue-400">
                      {uploadStatus.decryptionKey}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <Link to="/encryption" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Client-Side Encryption</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn more →</p>
        </Link>
        <Link to="/telegram" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
            <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Telegram Delivery</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn more →</p>
        </Link>
        <Link to="/storage" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Secure Storage</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn more →</p>
        </Link>
      </div>
    </div>
  )
}