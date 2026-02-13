# Deployment Guide - Vercel & Netlify

This guide will help you deploy the Secure Image Share application using the web interfaces of Vercel (backend) and Netlify (frontend).

## Prerequisites

Before starting, make sure you have:
- GitHub account with your code pushed
- MongoDB Atlas cluster (free tier works fine)
- Cloudinary account
- PayPal Developer account (for payments)
- Telegram Bot created

---

## Part 1: Deploy Backend to Vercel

### Step 1: Go to Vercel Dashboard

1. Open your browser and go to: https://vercel.com/dashboard
2. Sign up/login with your GitHub account
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Your Repository

1. Find your GitHub repository in the list
2. Click **"Import"** next to your repo name
3. If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

### Step 3: Configure Project

1. **Project Name**: `secure-img-share-backend` (or your preferred name)
2. **Framework Preset**: Select **"Other"**
3. **Root Directory**: Click **"Edit"** and select `/backend`
4. **Build Command**: Leave empty (Vercel will use vercel.json)
5. **Output Directory**: Leave empty

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these one by one:

```
NODE_ENV=production
PORT=3001

# MongoDB (Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-img-share?retryWrites=true&w=majority

# Cloudinary (Get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Telegram (Get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token

# JWT Secret (Generate a random string)
JWT_SECRET=your-random-jwt-secret-min-32-characters

# PayPal (Get from PayPal Developer Dashboard)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id (you'll update this after first deploy)
PAYPAL_ENVIRONMENT=sandbox (or production for live payments)

# Frontend URL (update after Netlify deployment)
FRONTEND_URL=https://your-frontend-url.netlify.app
```

**Important**: 
- For JWT_SECRET, use a long random string (32+ characters)
- For FRONTEND_URL, temporarily use your Netlify URL placeholder, you'll update it after deploying frontend

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (should take 1-2 minutes)
3. Once done, you'll get a URL like: `https://secure-img-share-backend-xxx.vercel.app`
4. **Copy this URL** - you'll need it for the frontend

### Step 6: Configure PayPal Webhook (After Deployment)

1. Go to https://developer.paypal.com/
2. Navigate to your app → Webhooks
3. Add webhook URL: `https://your-vercel-url.vercel.app/api/webhooks/paypal`
4. Select events (see backend/.env.example)
5. Copy the Webhook ID
6. Go back to Vercel dashboard → your project → Settings → Environment Variables
7. Add `PAYPAL_WEBHOOK_ID` with the copied value
8. Click **"Redeploy"** to apply changes

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Go to Netlify Dashboard

1. Open your browser and go to: https://app.netlify.com/
2. Sign up/login with your GitHub account
3. Click **"Add new site"** → **"Import an existing project"**

### Step 2: Connect to GitHub

1. Select **"GitHub"** as your Git provider
2. Authorize Netlify if prompted
3. Find and select your repository

### Step 3: Configure Build Settings

1. **Branch to deploy**: `main` (or your default branch)
2. **Base directory**: `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `dist`

**Important**: Don't click Deploy yet! First add environment variables.

### Step 4: Add Environment Variables

Click **"Show advanced"** → **"New variable"** and add:

```
VITE_API_URL=https://your-vercel-backend-url.vercel.app
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

Replace `your-vercel-backend-url` with the URL you copied from Vercel.

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (2-3 minutes)
3. You'll get a URL like: `https://secure-img-share-xxx.netlify.app`

### Step 6: Update Backend Environment Variable

1. Go back to Vercel dashboard
2. Find your backend project
3. Go to **Settings** → **Environment Variables**
4. Update `FRONTEND_URL` to your Netlify URL
5. Click **"Redeploy"**

---

## Part 3: Post-Deployment Setup

### 1. Update MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click **"Network Access"** in the left sidebar
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (or add Vercel's IP ranges)
5. Click **"Confirm"**

### 2. Update Cloudinary Settings

1. Go to Cloudinary Dashboard
2. Navigate to **Settings** → **Security**
3. No special configuration needed, but ensure your account is active

### 3. Update PayPal App Settings (for production)

When ready for production:
1. Go to PayPal Developer Dashboard
2. Switch from Sandbox to Live
3. Update `PAYPAL_ENVIRONMENT` to `production` in Vercel
4. Update `VITE_PAYPAL_CLIENT_ID` in Netlify with Live Client ID
5. Redeploy both

### 4. Set Custom Domain (Optional)

#### Vercel (Backend):
1. Go to Vercel Dashboard → your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

#### Netlify (Frontend):
1. Go to Netlify Dashboard → your site
2. Click **"Domain settings"**
3. Click **"Add custom domain"**
4. Enter your domain and follow instructions

---

## Part 4: Verify Deployment

### Test Backend:
1. Visit: `https://your-vercel-url.vercel.app/api/health`
2. Should return: `{"status":"OK","timestamp":"..."}`

### Test Frontend:
1. Visit your Netlify URL
2. Try uploading an image
3. Check that it connects to your backend

### Test Authentication:
1. Register a new account
2. Login
3. Check upload limits are enforced

---

## Troubleshooting

### Common Issues:

**1. CORS Errors**
- Make sure `FRONTEND_URL` in Vercel matches your Netlify URL exactly
- Include `https://` and no trailing slash

**2. MongoDB Connection Failed**
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure password doesn't contain special characters that need URL encoding

**3. Build Failures**
- Check build logs in Vercel/Netlify dashboard
- Ensure all environment variables are set
- Verify package.json has correct scripts

**4. 404 Errors**
- Backend: Check that `vercel.json` is in the backend folder
- Frontend: Check that `netlify.toml` is in the root folder

**5. PayPal Not Working**
- Verify Client ID is correct
- Check that webhook URL is correct
- Ensure `FRONTEND_URL` is set properly

---

## Monitoring & Maintenance

### Vercel Analytics:
- Function invocations
- Error rates
- Performance metrics

### Netlify Analytics:
- Site traffic
- Build history
- Form submissions

### MongoDB Atlas:
- Database connections
- Storage usage
- Performance metrics

---

## Important Notes:

1. **Free Tier Limits**:
   - Vercel: 100GB bandwidth, 1000GB-hours execution time
   - Netlify: 100GB bandwidth, 300 build minutes/month
   - MongoDB Atlas: 512MB storage (M0 free tier)
   - Cloudinary: 25GB storage, 25K transformations/month

2. **Security**:
   - Never commit `.env` files to GitHub
   - Use strong JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - Enable 2FA on all accounts

3. **Backups**:
   - Set up MongoDB Atlas backups (daily snapshots included in M10+)
   - Export important data regularly

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **PayPal Developer**: https://developer.paypal.com/docs/

Good luck with your deployment! 🚀
