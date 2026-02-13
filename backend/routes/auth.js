import express from 'express'
import User from '../models/User.js'
import { generateToken, authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name' })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    
    // Create user
    const user = new User({
      email,
      password,
      name
    })
    
    await user.save()
    
    // Generate token
    const token = generateToken(user._id)
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        uploadStats: user.uploadStats
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' })
    }
    
    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check password
    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate token
    const token = generateToken(user._id)
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        uploadStats: user.uploadStats
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ success: true, message: 'Logged out successfully' })
})

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    
    // Check and reset monthly counter if needed
    const now = new Date()
    const resetDate = new Date(user.uploadStats.monthResetDate)
    
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      user.uploadStats.currentMonth = 0
      user.uploadStats.monthResetDate = now
      await user.save()
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        uploadStats: user.uploadStats,
        remainingUploads: user.getRemainingUploads()
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user data' })
  }
})

// Check if user can upload
router.get('/can-upload', authMiddleware, async (req, res) => {
  try {
    const user = req.user
    const canUpload = user.canUpload()
    const remainingUploads = user.getRemainingUploads()
    
    res.json({
      canUpload,
      remainingUploads,
      subscription: user.subscription.type
    })
  } catch (error) {
    console.error('Can upload check error:', error)
    res.status(500).json({ error: 'Failed to check upload permissions' })
  }
})

export default router
