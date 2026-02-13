# Deployment Guide

## Production Deployment Options

### Option 1: Traditional VPS (Recommended for Control)

**Providers:** DigitalOcean, Linode, Vultr, AWS EC2, Google Cloud VM

**Requirements:**
- Ubuntu 22.04 LTS
- 2GB+ RAM
- 1 vCPU
- 20GB SSD

### Option 2: Platform as a Service (Easiest)

**Backend:**
- Render.com
- Railway.app
- Heroku
- Fly.io

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

### Option 3: Docker (Most Portable)

Use Docker Compose for full stack deployment.

---

## VPS Deployment Guide

### Step 1: Server Setup

```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install MongoDB (optional - can use Atlas)
# Or use MongoDB Atlas cloud service
```

### Step 2: MongoDB Setup (Atlas Recommended)

1. Create account at mongodb.com/atlas
2. Create new cluster (M0 Sandbox - Free tier)
3. Create database user
4. Add IP whitelist (0.0.0.0/0 for all IPs or your server IP)
5. Get connection string

### Step 3: Application Deployment

```bash
# Create app directory
mkdir -p /var/www/secure-img-share
cd /var/www/secure-img-share

# Clone repository
git clone <your-repo-url> .

# Setup Backend
cd backend
npm install --production

# Create production .env
nano .env
```

**Backend .env:**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/secure-img-share
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TELEGRAM_BOT_TOKEN=your_bot_token
FRONTEND_URL=https://yourdomain.com
```

```bash
# Start backend with PM2
pm2 start server.js --name secure-img-backend
pm2 startup
pm2 save

# Setup Frontend
cd ../frontend
npm install
npm run build

# Copy build to Nginx
sudo cp -r dist/* /var/www/html/
```

### Step 4: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/secure-img-share
```

**Nginx Config:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend - Static Files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase upload size for images
        client_max_body_size 50M;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/secure-img-share /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## Platform as a Service Deployment

### Render.com (Recommended)

#### Backend (Web Service)

1. Create new Web Service
2. Connect your GitHub repo
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Add Environment Variables
5. Deploy

#### Frontend (Static Site)

1. Create new Static Site
2. Connect same repo
3. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Add Environment Variable: `VITE_API_URL` = backend URL
5. Deploy

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Railway.app (Full Stack)

1. Connect GitHub repo
2. Railway auto-detects services
3. Add environment variables in dashboard
4. Deploy

---

## Docker Deployment

### Dockerfile - Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Dockerfile - Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: secure-img-backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MONGODB_URI=${MONGODB_URI}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - secure-img-network

  frontend:
    build: ./frontend
    container_name: secure-img-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - secure-img-network

networks:
  secure-img-network:
    driver: bridge
```

### Deploy with Docker Compose

```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/secure-img-share
```

### Staging

```env
NODE_ENV=staging
PORT=3001
FRONTEND_URL=https://staging.yourdomain.com
MONGODB_URI=mongodb+srv://.../secure-img-share-staging
```

### Production

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://.../secure-img-share-prod
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs secure-img-backend

# Monitor resources
pm2 monit

# Restart app
pm2 restart secure-img-backend

# View status
pm2 status
```

### Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
```

### Application Logs

```bash
# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View application logs
pm2 logs
```

---

## Security Checklist

### Server Security

- [ ] Firewall enabled (ufw)
- [ ] SSH key authentication only (disable password)
- [ ] Automatic security updates
- [ ] Fail2ban installed
- [ ] Non-root user for deployment

### Application Security

- [ ] HTTPS only (HSTS enabled)
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers set

### Database Security

- [ ] MongoDB auth enabled
- [ ] IP whitelist configured
- [ ] Backup schedule established
- [ ] Encryption at rest (if available)

---

## Backup Strategy

### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out=/backups/$DATE
aws s3 sync /backups/$DATE s3://your-backup-bucket/$DATE
```

### Cloudinary Backup

Cloudinary provides automatic backups for paid plans. For free tier:

```bash
# Download all images periodically
# Add to cron job
```

---

## Scaling

### Horizontal Scaling

When you need more capacity:

1. **Load Balancer:** Use Nginx or AWS ALB
2. **Multiple Backend Instances:** Run multiple Node.js processes
3. **MongoDB Replica Set:** For database redundancy
4. **CDN:** Cloudflare or AWS CloudFront for static assets

### Vertical Scaling

Increase server resources:
- Upgrade to 4GB+ RAM
- Add CPU cores
- Increase bandwidth

---

## Troubleshooting Deployment

### Common Issues

#### 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify backend is listening on correct port
netstat -tlnp | grep 3001
```

#### CORS Errors

```bash
# Check FRONTEND_URL matches exactly
# Must include https:// and match the browser URL
```

#### MongoDB Connection Failed

```bash
# Test connection
mongo "your-connection-string"

# Check IP whitelist in MongoDB Atlas
# Verify credentials
```

#### File Upload Fails

```bash
# Check Nginx client_max_body_size
# Verify Cloudinary credentials
# Check disk space: df -h
```

---

## Cost Estimation

### Development/Testing (Free Tier)

- **MongoDB Atlas:** M0 (Free) - 512MB
- **Cloudinary:** Free tier - 25GB storage
- **Render/Vercel:** Free tier
- **Telegram Bot:** Free

**Total: $0/month**

### Production (Small Scale)

- **VPS:** $5-10/month (DigitalOcean, Linode)
- **MongoDB Atlas:** M10 $57/month
- **Cloudinary:** $25/month (25GB+)
- **Domain:** $10-15/year

**Total: ~$90-100/month**

### Production (Medium Scale)

- **Load Balancer + 2 Servers:** $40/month
- **MongoDB Atlas:** M30 $280/month
- **Cloudinary:** $99/month (225GB)
- **CDN:** $20/month

**Total: ~$450/month**

---

## Maintenance

### Daily

- Check application logs
- Monitor error rates
- Verify backups ran

### Weekly

- Review security logs
- Check disk space
- Update dependencies
- Test restore from backup

### Monthly

- Security updates
- Dependency audit: `npm audit`
- Performance review
- Cost analysis

---

## Support & Resources

- **Deployment Issues:** devops@yourdomain.com
- **Documentation:** https://docs.yourdomain.com
- **Status Page:** https://status.yourdomain.com

---

**Last Updated:** February 2024  
**Version:** 1.0.0