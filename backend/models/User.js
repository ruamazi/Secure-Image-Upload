import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    paypalSubscriptionId: {
      type: String,
      default: null
    },
    paypalOrderId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'suspended', 'past_due'],
      default: 'active'
    }
  },
  paymentHistory: [{
    orderId: String,
    subscriptionId: String,
    amount: Number,
    currency: String,
    status: String,
    planType: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  uploadStats: {
    currentMonth: {
      type: Number,
      default: 0
    },
    monthResetDate: {
      type: Date,
      default: Date.now
    },
    totalUploads: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Check if upload limit reached
userSchema.methods.canUpload = function() {
  const now = new Date()
  const resetDate = new Date(this.uploadStats.monthResetDate)
  
  // Reset counter if it's a new month
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    this.uploadStats.currentMonth = 0
    this.uploadStats.monthResetDate = now
    return true
  }
  
  // Check limits based on subscription
  const limits = {
    free: 5,
    premium: 100,
    enterprise: 1000
  }
  
  return this.uploadStats.currentMonth < limits[this.subscription.type]
}

// Get remaining uploads
userSchema.methods.getRemainingUploads = function() {
  const limits = {
    free: 5,
    premium: 100,
    enterprise: 1000
  }
  
  return Math.max(0, limits[this.subscription.type] - this.uploadStats.currentMonth)
}

// Increment upload count
userSchema.methods.incrementUpload = async function() {
  this.uploadStats.currentMonth += 1
  this.uploadStats.totalUploads += 1
  await this.save()
}

export default mongoose.model('User', userSchema)
