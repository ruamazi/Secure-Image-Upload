# Quick Start Guide

## For Users

### 3-Step Upload Process

1. **Select Image** → Click upload box or drag & drop
2. **Enter Telegram ID** → Get it from @userinfobot on Telegram
3. **Click Upload** → Wait for encryption and confirmation

### 2-Step View Process

1. **Check Telegram** → Click the link in the message
2. **Enter Key** → Copy key from Telegram, paste it, view image

---

## For Administrators

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd secure-img-share

# 2. Setup Backend
cd backend
cp .env.example .env
npm install

# 3. Configure Environment Variables
# Edit .env file with your credentials:
# - MongoDB URI
# - Cloudinary credentials  
# - Telegram Bot Token

# 4. Setup Frontend
cd ../frontend
cp .env.example .env
npm install
# Note: vite.config.js is already configured

# 5. Run both servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:  
cd frontend && npm run dev
```

### Required Accounts Setup

#### 1. MongoDB
- Sign up at mongodb.com
- Create free cluster
- Get connection string
- Whitelist your IP

#### 2. Cloudinary
- Sign up at cloudinary.com
- Go to Dashboard
- Copy Cloud Name, API Key, API Secret

#### 3. Telegram Bot
- Message @BotFather
- Type `/newbot`
- Follow prompts to create bot
- Copy the bot token
- **Important:** Start a chat with your bot (click Start)

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
```

---

## Common Commands

### Development

```bash
# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev

# Install new backend package
cd backend && npm install package-name

# Install new frontend package
cd frontend && npm install package-name
```

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Deploy backend
cd backend && npm start
```

### Database

```bash
# MongoDB shell
mongosh "your-connection-string"

# View images collection
db.images.find()

# Clear all images
db.images.deleteMany({})
```

---

## Troubleshooting Common Issues

### "Cannot connect to MongoDB"
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure MongoDB service is running

### "Cloudinary upload failed"
- Verify API credentials
- Check Cloudinary dashboard for limits
- Ensure file size under 50MB

### "Telegram messages not sending"
- **Ensure user started chat with bot first (click Start in Telegram)**
- Verify bot token is correct
- Check bot isn't blocked by user
- Check browser console for error details

### "CORS errors in browser"
- Check FRONTEND_URL in backend .env
- Ensure URLs match exactly (including http/https)
- Add CORS origins if needed in server.js

### "Client-side encryption slow"
- Normal for large images (10MB+)
- Browser must support Web Crypto API
- Try Chrome/Firefox for best performance

---

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] Environment variables not committed to git
- [ ] MongoDB authentication enabled
- [ ] Cloudinary restricted folders
- [ ] Telegram bot token kept secret
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] No server-side logging of keys

---

## Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3001/api/health
```

### Check Recent Uploads
```bash
# MongoDB
db.images.find().sort({createdAt: -1}).limit(10)
```

---

## Support Resources

- **Main Documentation:** README.md
- **User Guide:** USER-GUIDE.md
- **API Documentation:** See server.js comments
- **Issues:** [GitHub Issues](your-repo-url)

---

**Need Help?** Contact: support@yourdomain.com