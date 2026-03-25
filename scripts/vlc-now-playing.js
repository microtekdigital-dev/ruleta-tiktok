/**
 * vlc-now-playing.js
 * Lee la canción actual de VLC via su API HTTP y la manda a la ruleta.
 * No usa PowerShell - compatible con antivirus.
 *
 * Requiere: VLC con interfaz HTTP activada, password "vlc"
 * Uso: node scripts/vlc-now-playing.js
 */

const http = require('http')

const VLC_HOST = 'localhost'
const VLC_PORT = 8080
const VLC_PASSWORD = 'vlc'
const API_URL = 'http://localhost:3000/api/now-playing'

let lastTitle = ''

function getVlcStatus() {
  return new Promise((resolve) => {
    const auth = Buffer.from(`:${VLC_PASSWORD}`).toString('base64')
    const options = {
      hostname: VLC_HOST,
      port: VLC_PORT,
      path: '/requests/status.xml',
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
      timeout: 3000,
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data))
    })

    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
    req.end()
  })
}

function extractTitle(xml) {
  if (!xml) return null

  // Buscar <info name='title'>VALOR</info>
  const titleMatch = xml.match(/<info name='title'>([^<]+)<\/info>/)
  if (titleMatch) return titleMatch[1].trim()

  // Fallback: nombre de archivo
  const fileMatch = xml.match(/<info name='filename'>([^<]+)<\/info>/)
  if (fileMatch) return fileMatch[1].trim()

  return null
}

async function sendToApi(title) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
  } catch (e) {
    console.error('Error enviando a API:', e.message)
  }
}

async function poll() {
  const xml = await getVlcStatus()
  const title = extractTitle(xml)

  if (title && title !== lastTitle) {
    console.log(`▶ Reproduciendo: ${title}`)
    lastTitle = title
    await sendToApi(title)
  } else if (!title && lastTitle) {
    console.log('⏹ Sin reproducción')
    lastTitle = ''
    await sendToApi('')
  }

  setTimeout(poll, 3000)
}

console.log('🎵 VLC Now Playing iniciado (sin PowerShell)')
console.log(`   Conectando a VLC en ${VLC_HOST}:${VLC_PORT}...`)
poll()
