import cloudinaryModule from 'cloudinary'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cloudinary = cloudinaryModule.v2

console.log('[CLOUDINARY] Module loaded, creating storage...')
console.log('[CLOUDINARY] Checking credentials at module load:')
console.log('[CLOUDINARY] Cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET')

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log('[CLOUDINARY] Created uploads directory:', uploadDir)
}

// Use disk storage temporarily to test if the issue is Cloudinary-specific
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('[DISK STORAGE] Saving to:', uploadDir)
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = `encrypted-${uniqueSuffix}`
    console.log('[DISK STORAGE] Filename:', filename)
    cb(null, filename)
  }
})

const uploadMiddleware = multer({ 
  storage: diskStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
})

console.log('[CLOUDINARY] Disk storage middleware created')

export const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      console.log('[UPLOAD MIDDLEWARE] Starting multer upload for field:', fieldName)
      const startTime = Date.now()
      
      uploadMiddleware.single(fieldName)(req, res, (err) => {
        const duration = Date.now() - startTime
        if (err) {
          console.error('[UPLOAD MIDDLEWARE] ERROR after', duration, 'ms:', err.message)
          console.error('[UPLOAD MIDDLEWARE] ERROR stack:', err.stack)
          return next(err)
        }
        console.log('[UPLOAD MIDDLEWARE] Upload completed in', duration, 'ms')
        console.log('[UPLOAD MIDDLEWARE] req.file:', req.file ? {
          filename: req.file.filename,
          size: req.file.size,
          path: req.file.path
        } : 'NO FILE')
        
        next()
      })
    }
  }
}

export default cloudinary
