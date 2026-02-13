import TelegramBot from 'node-telegram-bot-api'

let bot = null

const getBot = () => {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      console.error('[TELEGRAM] Bot token not configured')
      return null
    }
    bot = new TelegramBot(token, { polling: false })
  }
  return bot
}

export const sendDecryptionKey = async (chatId, imageId, decryptionKey, baseUrl) => {
  try {
    const botInstance = getBot()
    if (!botInstance) {
      console.error('[TELEGRAM] Cannot send message: bot not initialized')
      return false
    }

    const viewUrl = `${baseUrl}/view/${imageId}`
    
    const message = `
🔐 *Secure Image Shared*

Someone has shared an encrypted image with you!

📎 *View Image:* ${viewUrl}

🔑 *Decryption Key:*
\`\`\`
${decryptionKey}
\`\`\`

⚠️ *Important:*
• The decryption key is required to view the image
• This message will self-destruct in your chat history
• The image expires after 72 hours

🔒 Your image is protected with AES-256-GCM encryption
    `

    await botInstance.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    })

    console.log('[TELEGRAM] Message sent successfully to:', chatId)
    return true
  } catch (error) {
    console.error('[TELEGRAM] Send error:', error.message)
    return false
  }
}

export default getBot