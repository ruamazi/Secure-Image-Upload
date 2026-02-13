import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import cloudinaryModule from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('[SERVER] Configuring Cloudinary with values:')
console.log('[SERVER] Cloud name from env:', process.env.CLOUDINARY_CLOUD_NAME)
console.log('[SERVER] API Key from env:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET')
console.log('[SERVER] API Secret from env:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET')

cloudinaryModule.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  api_proxy: null
})

console.log('[SERVER] Cloudinary configured. Current config:', cloudinaryModule.v2.config().cloud_name)

import Image from '../models/Image.js'
import User from '../models/User.js'
import { upload } from '../config/cloudinary.js'
import { sendDecryptionKey } from '../services/telegram.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'
import authRoutes from '../routes/auth.js'
import paymentRoutes from '../routes/payment.js'
import webhookRoutes from '../routes/webhooks.js'

const app = express()

// Enable CORS for all origins in production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json())
app.use(cookieParser())

// Connect to MongoDB with retry logic
let isConnected = false

const connectDB = async () => {
  if (isConnected) return
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-img-share', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    isConnected = true
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// Auth routes
app.use('/api/auth', authRoutes)

// Payment routes
app.use('/api/payment', paymentRoutes)

// Webhook routes (needs raw body for PayPal signature verification)
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

app.post('/api/upload', optionalAuth, upload.single('image'), async (req, res) => {
  console.log('[UPLOAD] Multer middleware completed')
  
  try {
    const { telegramId, originalName, mimeType } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' })
    }

    // Check user upload limits if authenticated
    let user = req.user
    if (user) {
      const canUpload = user.canUpload()
      if (!canUpload) {
        return res.status(403).json({ 
          error: 'Upload limit reached',
          message: 'You have reached your monthly upload limit. Upgrade to premium for unlimited uploads.',
          upgradeRequired: true
        })
      }
    }

    console.log('[UPLOAD] Uploading to Cloudinary...')
    console.log('[UPLOAD] Cloudinary config before upload:', cloudinaryModule.v2.config().cloud_name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const publicId = `encrypted-${uniqueSuffix}`
    
    let cloudinaryResult
    try {
      cloudinaryResult = await cloudinaryModule.v2.uploader.upload(req.file.path, {
        folder: 'secure-images',
        resource_type: 'auto',
        public_id: publicId,
        timeout: 120000
      })
      console.log('[UPLOAD] Cloudinary upload successful:', cloudinaryResult.secure_url)
    } catch (cloudinaryError) {
      const errorMsg = cloudinaryError.message || cloudinaryError.error?.message || 'Unknown Cloudinary error'
      console.error('[UPLOAD] Cloudinary upload error:', errorMsg)
      console.error('[UPLOAD] Cloudinary error details:', cloudinaryError)
      throw new Error(`Cloudinary upload failed: ${errorMsg}`)
    }
    
    // Clean up local file
    await fs.unlink(req.file.path)
    console.log('[UPLOAD] Local file cleaned up')

    const imageId = uuidv4()
    
    const image = new Image({
      imageId,
      userId: user ? user._id : null,
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      originalName: originalName || 'image',
      mimeType: mimeType || 'image/jpeg',
      telegramId,
      fileSize: req.file.size
    })

    await image.save()
    console.log('[UPLOAD] Saved to MongoDB')

    // Increment user upload count if authenticated
    if (user) {
      await user.incrementUpload()
      console.log('[UPLOAD] User upload count incremented')
    }
    
    res.json({
      success: true,
      imageId,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('[UPLOAD] ERROR:', error.message)
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path)
        console.log('[UPLOAD] Cleaned up local file after error')
      } catch (cleanupError) {
        console.error('[UPLOAD] Failed to clean up local file:', cleanupError.message)
      }
    }
    res.status(500).json({ error: 'Failed to upload image', details: error.message })
  }
})

app.post('/api/notify', async (req, res) => {
  try {
    const { telegramId, imageId, decryptionKey } = req.body
    
    if (!telegramId || !imageId || !decryptionKey) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    
    const sent = await sendDecryptionKey(telegramId, imageId, decryptionKey, baseUrl)
    
    if (sent) {
      res.json({ success: true, message: 'Notification sent successfully' })
    } else {
      res.status(500).json({ error: 'Failed to send Telegram notification' })
    }
  } catch (error) {
    console.error('[NOTIFY] ERROR:', error.message)
    res.status(500).json({ error: 'Failed to send notification' })
  }
})

app.get('/api/image/:id/info', async (req, res) => {
  try {
    const { id } = req.params
    
    const image = await Image.findOne({ imageId: id })
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }

    res.json({
      imageId: image.imageId,
      originalName: image.originalName,
      mimeType: image.mimeType,
      createdAt: image.createdAt
    })
  } catch (error) {
    console.error('Get image info error:', error)
    res.status(500).json({ error: 'Failed to get image info' })
  }
})

app.get('/api/image/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const image = await Image.findOne({ imageId: id })
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const response = await fetch(image.cloudinaryUrl)
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Image data not found' })
    }

    const buffer = await response.arrayBuffer()
    
    res.set('Content-Type', 'application/octet-stream')
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Get image error:', error)
    res.status(500).json({ error: 'Failed to get image' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: isConnected ? 'connected' : 'disconnected'
  })
})

// Export for Vercel serverless
export default app
