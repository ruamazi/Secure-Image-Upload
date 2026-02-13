# Secure Image Share

A secure image sharing platform with end-to-end encryption. Images are encrypted in the browser before upload, ensuring even the server and storage provider cannot view the content.

## Features

- **Client-Side Encryption**: Images are encrypted using AES-256-GCM before leaving your browser
- **Telegram Integration**: Decryption keys are sent securely via Telegram Bot
- **Dark/Light Theme**: Modern UI with theme support
- **Auto-Expiry**: Images automatically expire after 72 hours
- **Secure Storage**: Encrypted data stored on Cloudinary (unreadable without the key)

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Web Crypto API (for encryption)
- Axios

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Cloudinary (for encrypted file storage)
- Telegram Bot API

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary account
- Telegram Bot

### 1. Clone and Install

```bash
cd secure-img-share

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**Note:** The frontend includes a `vite.config.js` file for Vite configuration. This file is pre-configured and ready to use.

### 2. Configure Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Required backend variables:
- `MONGODB_URI`: Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard
- `CLOUDINARY_API_KEY`: From Cloudinary dashboard
- `CLOUDINARY_API_SECRET`: From Cloudinary dashboard
- `TELEGRAM_BOT_TOKEN`: From @BotFather
- `FRONTEND_URL`: Your frontend URL

#### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
```

### 3. Create Telegram Bot

1. Message @BotFather on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token to your `.env` file
4. Get your Telegram ID by messaging @userinfobot

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## How It Works

1. **Upload**: User selects an image and enters their Telegram ID
2. **Encryption**: The image is encrypted in the browser using AES-256-GCM
3. **Storage**: Only the encrypted data is sent to Cloudinary
4. **Notification**: The decryption key is sent to the user's Telegram
5. **Decryption**: When viewing, the encrypted data is fetched and decrypted in the browser

## Security

- Encryption happens client-side, the key never leaves the browser during upload
- Only encrypted data touches the server and Cloudinary
- Decryption keys are sent separately via Telegram
- Images auto-expire after 72 hours
- No persistent storage of decryption keys on the server

## License

MIT