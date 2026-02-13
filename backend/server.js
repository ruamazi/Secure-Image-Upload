import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import cloudinaryModule from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'

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

import Image from './models/Image.js'
import { upload } from './config/cloudinary.js'
import { sendDecryptionKey } from './services/telegram.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-img-share')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.post('/api/upload', upload.single('image'), async (req, res) => {
  console.log('[UPLOAD] Multer middleware completed')
  
  try {
    const { telegramId, originalName, mimeType } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' })
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
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      originalName: originalName || 'image',
      mimeType: mimeType || 'image/jpeg',
      telegramId,
      fileSize: req.file.size
    })

    await image.save()
    console.log('[UPLOAD] Saved to MongoDB')
    
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
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
