/**
 * tiktok-connect.js
 * Conecta a TikTok Live y manda los regalos a la API de la ruleta.
 *
 * Uso: node scripts/tiktok-connect.js
 */

const { WebcastPushConnection } = require('tiktok-live-connector')

// *** CAMBIA ESTO por tu usuario de TikTok (sin @) ***
const TIKTOK_USERNAME = 'daleplayjuan'

const API_URL = 'http://localhost:3000/api/gift'
const CHALLENGE_URL = 'http://localhost:3000/api/word-challenge'

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME)

async function sendGift(username, giftName, giftEmoji, value, avatarUrl) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, gift: 'rose', value, giftName, giftEmoji, avatarUrl }),
    })
    console.log(`🎁 ${username} envió ${giftEmoji} ${giftName} (valor: ${value})`)
  } catch (e) {
    console.error('Error enviando regalo:', e.message)
  }
}

tiktok.connect()
  .then(() => {
    console.log(`✅ Conectado al live de @${TIKTOK_USERNAME}`)
  })
  .catch(err => {
    console.error('❌ Error conectando a TikTok:', err.message)
    console.error('Asegurate de estar en vivo en TikTok.')
  })

// Escuchar regalos
tiktok.on('gift', data => {
  // Solo procesar cuando el regalo está completo (no durante el streak)
  if (data.giftType === 1 && !data.repeatEnd) return

  const username = data.uniqueId || data.nickname || 'Anónimo'
  const giftName = data.giftName || 'Regalo'
  const value = data.diamondCount || 1
  const avatarUrl = data.profilePictureUrl || null

  // Intentar mapear a emoji conocido, sino usar 🎁
  const emojiMap = {
    'Rosa': '🌹', 'Rose': '🌹',
    'León': '🦁', 'Lion': '🦁',
    'Universo': '🌌', 'Universe': '🌌',
    'Cohete': '🚀', 'Rocket': '🚀',
    'Corona': '👑', 'Crown': '👑',
    'Corazón': '❤️', 'Heart': '❤️',
    'Diamante': '💎', 'Diamond': '💎',
    'Arcoíris': '🌈', 'Rainbow': '🌈',
  }
  const giftEmoji = emojiMap[giftName] || '🎁'

  sendGift(username, giftName, giftEmoji, value, avatarUrl)
})

// Escuchar comentarios para el desafío de palabra
tiktok.on('chat', async data => {
  try {
    const res = await fetch(CHALLENGE_URL)
    const { challenge } = await res.json()
    if (!challenge) return

    const comment = (data.comment || '').toLowerCase().trim()
    const username = data.uniqueId || data.nickname || 'Anónimo'

    if (comment.includes(challenge.word)) {
      const result = await fetch(CHALLENGE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (result.ok) {
        console.log(`🏆 @${username} ganó el desafío escribiendo "${challenge.word}"`)
      }
    }
  } catch (e) {
    console.error('Error en desafío de palabra:', e.message)
  }
})

// Reconectar si se cae
tiktok.on('disconnected', () => {  console.log('⚠️ Desconectado. Reconectando en 5s...')
  setTimeout(() => tiktok.connect(), 5000)
})

tiktok.on('error', err => {
  console.error('Error TikTok:', err)
})
