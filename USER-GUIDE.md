# User Guide - Secure Image Share

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [How to Upload an Image](#how-to-upload-an-image)
4. [Receiving Your Decryption Key](#receiving-your-decryption-key)
5. [How to View an Image](#how-to-view-an-image)
6. [Security Tips](#security-tips)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Overview

Secure Image Share is a privacy-focused platform that allows you to share images with complete confidentiality. Your images are encrypted **in your browser** before being uploaded, which means:

- **We cannot see your images** - only encrypted data reaches our servers
- **Cloud storage cannot see your images** - they store only encrypted blobs
- **Only you have the key** - the decryption key is sent directly to your Telegram

---

## Getting Started

### What You Need

1. **A Telegram Account** - Required to receive decryption keys securely
2. **Your Telegram ID** - A numeric identifier for your Telegram account
3. **Modern Web Browser** - Chrome, Firefox, Safari, or Edge (updated within last 2 years)

### Finding Your Telegram ID

Before uploading, you need to know your Telegram numeric ID:

1. Open Telegram app or web version
2. Search for **@userinfobot**
3. Start a conversation with the bot
4. The bot will reply with your Telegram ID (a number like `123456789`)
5. **Save this number** - you'll need it for every upload

**Note:** This is NOT your username (@username). It must be the numeric ID.

### Start Chat with the Bot

**⚠️ CRITICAL:** Before uploading, you must start a conversation with the app's Telegram bot:

1. Search for your bot's username in Telegram (the one you created with @BotFather)
2. Click **Start** or send `/start` message to the bot
3. The bot will acknowledge (e.g., "Bot started")
4. **Without this step, you won't receive decryption keys!**

**Why?** Telegram bots can only message users who have initiated contact first (privacy protection).

---

## How to Upload an Image

### Step 1: Select Your Image

1. Visit the Secure Image Share website
2. Click on the upload area (or drag and drop an image)
3. Select any image file from your computer:
   - Supported formats: JPG, PNG, GIF, WebP, BMP
   - Maximum size: 50 MB
4. You'll see a green checkmark when the image is selected

### Step 2: Enter Your Telegram ID

1. Find the "Your Telegram ID" field
2. Enter the numeric ID you got from @userinfobot
3. Double-check the number is correct - this is where your decryption key will be sent

### Step 3: Encrypt and Upload

1. Click the **"Encrypt & Upload"** button
2. Wait for the encryption process:
   - Your browser will encrypt the image using military-grade AES-256 encryption
   - This happens locally on your device
   - Progress bar shows encryption and upload status
3. **Do not close the browser tab** until upload completes

### Step 4: Confirmation

After successful upload:
- You'll see a success message
- The decryption key is displayed on screen (save it!)
- A copy of the key is sent to your Telegram
- The image link is also sent to your Telegram

---

## Receiving Your Decryption Key

### Telegram Message

Within seconds of uploading, you'll receive a Telegram message from our bot containing:

```
🔐 Secure Image Shared

Someone has shared an encrypted image with you!

📎 View Image: https://yourdomain.com/view/abc-123-xyz

🔑 Decryption Key:
```
[Your long decryption key here]
```

⚠️ Important:
• The decryption key is required to view the image
• This message contains sensitive information
• The image expires after 72 hours

🔒 Your image is protected with AES-256-GCM encryption
```

### What to Save

**Save BOTH of these:**
1. **The View URL** - Link to access your image
2. **The Decryption Key** - Long string of random characters

**⚠️ Important:** If you lose the decryption key, the image CANNOT be recovered. We do not store keys!

---

## How to View an Image

### Method 1: Using the Telegram Link

1. Open the Telegram message
2. Click the "View Image" link
3. You'll be taken to the decryption page
4. Copy the decryption key from the Telegram message
5. Paste it into the "Decryption Key" field
6. Click "Decrypt & View Image"
7. Your browser will decrypt and display the image

### Method 2: Direct Access

If you have the URL and key:

1. Visit the image URL directly (format: `https://yourdomain.com/view/[image-id]`)
2. Enter the decryption key when prompted
3. Click to decrypt and view

### After Decryption

Once decrypted, you can:
- **View** the image in your browser
- **Download** the original image file
- **Open** in a new tab for full resolution

**Note:** Decryption happens in your browser. The key is never sent to our servers.

---

## Security Tips

### ✅ Do's

- **Verify the URL** - Always check you're on the correct website
- **Use private browsing** - For extra privacy, use incognito/private mode
- **Clear browser cache** - After viewing sensitive images
- **Save keys securely** - Use a password manager for decryption keys
- **Share carefully** - Only send the decryption key through secure channels

### ❌ Don'ts

- **Don't share keys in public** - Never post decryption keys publicly
- **Don't screenshot keys** - Screenshots can be backed up to cloud services
- **Don't trust unofficial apps** - Only use the official website
- **Don't delay too long** - Images expire after 72 hours

### Advanced Security

For maximum privacy:

1. **Use Tor Browser** - Access through Tor for anonymity
2. **VPN** - Use a VPN to hide your IP address
3. **Verify HTTPS** - Ensure the connection is secure (padlock icon)
4. **Browser isolation** - Use a separate browser profile for sensitive content

---

## Troubleshooting

### "Invalid decryption key" Error

**Causes:**
- Key was copied incorrectly
- Key is incomplete
- Wrong key for this image

**Solutions:**
1. Copy the key directly from Telegram (avoid manual typing)
2. Ensure you copied the entire key (it's very long)
3. Check you're using the correct key for this specific image

### "Image not found" Error

**Causes:**
- Image has expired (older than 72 hours)
- Wrong URL
- Image was deleted

**Solutions:**
1. Check the URL is correct
2. Verify the image isn't older than 72 hours
3. Contact the sender for a new upload

### Telegram Message Not Received

**Causes:**
- Wrong Telegram ID entered
- **Didn't start chat with the bot first (most common)**
- Bot blocked
- Privacy settings

**Solutions:**
1. **MOST COMMON FIX:** Open Telegram, find the bot, and click **Start** before uploading
2. Verify your Telegram ID using @userinfobot again
3. Make sure you haven't blocked our bot
4. Check Telegram privacy settings allow messages from bots
5. Try uploading again with the correct ID

**Still not working?** Check the browser console (F12) for error messages.

### Upload Stuck or Failed

**Solutions:**
1. Check your internet connection
2. Try a smaller image file
3. Clear browser cache and try again
4. Use a different browser
5. Ensure file is under 50 MB

### Decryption Taking Too Long

**Normal behavior:** Large images (10+ MB) may take 10-30 seconds to decrypt

**If stuck:**
1. Refresh the page
2. Re-enter the decryption key
3. Try a different browser

---

## FAQ

### Q: Can you see my images?

**A:** No. Images are encrypted in your browser before upload. We only store encrypted data that is mathematically impossible to decrypt without your key.

### Q: Can Cloudinary see my images?

**A:** No. They store only the encrypted binary data. It looks like random noise without the decryption key.

### Q: What happens if I lose the decryption key?

**A:** The image is permanently lost. We cannot recover it. Always save your keys!

### Q: How long are images stored?

**A:** 72 hours (3 days) from upload. After that, they're automatically deleted.

### Q: Is there a file size limit?

**A:** Yes, 50 MB per image.

### Q: Can I share the image with others?

**A:** Yes! Share both the URL and the decryption key. Anyone with both can view the image.

### Q: Is this service free?

**A:** [Add your pricing model here]

### Q: Do you keep logs?

**A:** We store minimal metadata (upload time, file size) but never the image content or decryption keys.

### Q: Can I delete an image early?

**A:** Currently no, but images auto-delete after 72 hours.

### Q: Why Telegram for keys?

**A:** Telegram provides:
- End-to-end encryption (Secret Chats)
- Self-destructing messages
- No email spam filters
- Instant delivery

### Q: Is the encryption really secure?

**A:** Yes, we use:
- **AES-256-GCM** - Industry standard encryption
- **256-bit keys** - Impossible to brute force
- **Unique keys per image** - No shared keys between uploads
- **Client-side encryption** - Keys never touch our servers

### Q: Can I use this on mobile?

**A:** Yes! The website works on mobile browsers. However, copying long decryption keys is easier on desktop.

### Q: What browsers are supported?

**A:** Chrome, Firefox, Safari, Edge (latest 2 versions). Internet Explorer is NOT supported.

### Q: Do I need to install anything?

**A:** No. It works in your web browser. No apps or extensions needed.

### Q: Can the government access my images?

**A:** Even with a court order, we cannot provide image contents or decryption keys. We simply don't have them.

---

## Support

Having issues? Contact us:

- **Email:** support@yourdomain.com
- **Telegram:** @yoursupportbot
- **Documentation:** https://docs.yourdomain.com

---

## Legal & Privacy

### Terms of Use

- Do not use for illegal content
- Do not upload copyrighted material without permission
- Users are responsible for shared content
- Service provided "as-is"

### Privacy Policy

- We do not view or analyze your images
- No tracking cookies
- Minimal metadata retention
- 72-hour data lifecycle

---

**Last Updated:** February 2024  
**Version:** 1.0.0