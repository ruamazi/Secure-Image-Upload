const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12

export async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

export async function importKey(keyBase64) {
  const keyBuffer = base64ToArrayBuffer(keyBase64)
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['decrypt']
  )
}

export async function encryptFile(file, key) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const fileBuffer = await file.arrayBuffer()
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    fileBuffer
  )

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  return combined
}

export async function decryptFile(encryptedData, key) {
  const data = new Uint8Array(encryptedData)
  const iv = data.slice(0, IV_LENGTH)
  const encrypted = data.slice(IV_LENGTH)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    encrypted
  )

  return decrypted
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function arrayBufferToBlob(buffer, mimeType) {
  return new Blob([buffer], { type: mimeType })
}