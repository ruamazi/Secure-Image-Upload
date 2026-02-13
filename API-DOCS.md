# API Documentation

## Base URL

```
Development: http://localhost:3001
Production: https://your-api-domain.com
```

## Authentication

Currently, the API does not require authentication tokens. Rate limiting is recommended for production.

---

## Endpoints

### 1. Upload Image

Upload an encrypted image file.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Encrypted image file (binary) |
| `telegramId` | String | Yes | Recipient's Telegram numeric ID |
| `originalName` | String | No | Original filename before encryption |
| `mimeType` | String | No | Original MIME type (e.g., image/jpeg) |

**Example Request (cURL):**

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "image=@encrypted_image.bin" \
  -F "telegramId=123456789" \
  -F "originalName=photo.jpg" \
  -F "mimeType=image/jpeg"
```

**Example Request (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append('image', encryptedFile);
formData.append('telegramId', '123456789');
formData.append('originalName', 'photo.jpg');
formData.append('mimeType', 'image/jpeg');

const response = await fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "imageId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Image uploaded successfully"
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "error": "No image file provided"
}

// 400 Bad Request
{
  "error": "Telegram ID is required"
}

// 500 Internal Server Error
{
  "error": "Failed to upload image",
  "details": "Cloudinary upload failed: Request Timeout"
}
```

**Notes:**
- Upload timeout is set to 120 seconds to accommodate large files and slow connections
- Files are uploaded to Cloudinary with automatic resource type detection

---

### 2. Send Telegram Notification

Send the decryption key to user via Telegram.

**Endpoint:** `POST /api/notify`

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `telegramId` | String | Yes | Recipient's Telegram numeric ID |
| `imageId` | String | Yes | UUID returned from upload |
| `decryptionKey` | String | Yes | Base64-encoded AES key |

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "decryptionKey": "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY="
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "error": "Missing required fields"
}

// 500 Internal Server Error
{
  "error": "Failed to send Telegram notification"
}
```

---

### 3. Get Image Info

Retrieve metadata about an image without downloading it.

**Endpoint:** `GET /api/image/:id/info`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Image UUID |

**Example Request:**

```bash
curl http://localhost:3001/api/image/550e8400-e29b-41d4-a716-446655440000/info
```

**Success Response (200 OK):**

```json
{
  "imageId": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "createdAt": "2024-02-12T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Image not found"
}
```

---

### 4. Download Encrypted Image

Download the encrypted image data for client-side decryption.

**Endpoint:** `GET /api/image/:id`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Image UUID |

**Example Request:**

```bash
curl http://localhost:3001/api/image/550e8400-e29b-41d4-a716-446655440000 \
  --output encrypted_image.bin
```

**Success Response (200 OK):**

Returns binary data (encrypted image) with `Content-Type: application/octet-stream`

**Error Responses:**

```json
// 404 Not Found
{
  "error": "Image not found"
}

// 404 Not Found (expired)
{
  "error": "Image data not found"
}
```

---

### 5. Health Check

Check API status and connectivity.

**Endpoint:** `GET /api/health`

**Example Request:**

```bash
curl http://localhost:3001/api/health
```

**Success Response (200 OK):**

```json
{
  "status": "OK",
  "timestamp": "2024-02-12T10:30:00.000Z"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 404 | Not Found - Image doesn't exist or expired |
| 500 | Server Error - Internal server problem |

---

## Rate Limiting

Recommended rate limits for production:

- **Upload:** 10 requests per minute per IP
- **Download:** 30 requests per minute per IP
- **Notification:** 5 requests per minute per IP

---

## Data Models

### Image Schema

```javascript
{
  imageId: String,           // UUID v4
  cloudinaryUrl: String,     // Cloudinary storage URL
  cloudinaryPublicId: String,// Cloudinary public ID
  originalName: String,      // Original filename
  mimeType: String,          // Original MIME type
  telegramId: String,        // Recipient Telegram ID
  fileSize: Number,          // File size in bytes
  createdAt: Date            // Auto-expires after 72 hours
}
```

---

## Encryption Specification

### Algorithm

- **Algorithm:** AES-256-GCM
- **Key Size:** 256 bits
- **IV Size:** 96 bits (12 bytes)
- **Tag Size:** 128 bits (authenticated encryption)

### Encryption Format

```
[IV (12 bytes)] + [Encrypted Data + Auth Tag]
```

### Key Format

- Base64-encoded raw key
- Generated using `crypto.subtle.generateKey()`
- Unique per image upload

### Client-Side Decryption Flow

1. Fetch encrypted data via `GET /api/image/:id`
2. Extract IV (first 12 bytes)
3. Extract ciphertext (remaining bytes)
4. Import key using `crypto.subtle.importKey()`
5. Decrypt using AES-GCM with extracted IV
6. Convert decrypted ArrayBuffer to Blob
7. Create object URL for display

---

## CORS Configuration

The API allows cross-origin requests from configured domains:

```javascript
// Default: Allows all origins (development only)
app.use(cors());

// Production: Restrict to specific origins
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com']
}));
```

---

## Webhooks (Future)

Planned webhook endpoints for event notifications:

### Upload Completed

```http
POST https://your-webhook-url.com/upload
{
  "event": "upload.completed",
  "imageId": "...",
  "timestamp": "..."
}
```

### Image Viewed

```http
POST https://your-webhook-url.com/view
{
  "event": "image.viewed",
  "imageId": "...",
  "timestamp": "..."
}
```

---

## SDK Examples

### JavaScript/TypeScript SDK

```typescript
class SecureImageClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async uploadImage(
    encryptedFile: File,
    telegramId: string,
    originalName: string,
    mimeType: string
  ): Promise<{ imageId: string }> {
    const formData = new FormData();
    formData.append('image', encryptedFile);
    formData.append('telegramId', telegramId);
    formData.append('originalName', originalName);
    formData.append('mimeType', mimeType);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async sendNotification(
    telegramId: string,
    imageId: string,
    decryptionKey: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, imageId, decryptionKey })
    });

    if (!response.ok) {
      throw new Error(`Notification failed: ${response.statusText}`);
    }
  }

  async downloadImage(imageId: string): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/api/image/${imageId}`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }
}
```

---

## Testing

### Using Postman

1. Import the API collection
2. Set environment variables:
   - `base_url`: Your API URL
   - `image_id`: Image UUID for testing
3. Test endpoints in order:
   - Health check
   - Upload (with file)
   - Get info
   - Download

### Using curl

```bash
# Test all endpoints

# 1. Health check
curl http://localhost:3001/api/health | jq

# 2. Upload
curl -X POST http://localhost:3001/api/upload \
  -F "image=@test.jpg" \
  -F "telegramId=123456789" | jq

# 3. Get info (replace UUID)
curl http://localhost:3001/api/image/YOUR-UUID/info | jq

# 4. Download (replace UUID)
curl http://localhost:3001/api/image/YOUR-UUID --output downloaded.bin
```

---

## Changelog

### v1.0.1 (2024-02-13)
- Fixed Cloudinary upload timeout issues (increased to 120s timeout)
- Fixed node-fetch compatibility for Node.js 18+ (using native fetch)
- Fixed Telegram bot initialization to properly load environment variables
- Added automatic cleanup of temporary files on upload failure
- Improved error messages for failed uploads

### v1.0.0 (2024-02-12)
- Initial API release
- Upload endpoint with Cloudinary storage
- Telegram notification system
- Client-side encryption support
- 72-hour auto-expiry

---

**For questions or issues, contact:** api-support@yourdomain.com