/**
 * spotify-now-playing.js
 * Lee la canción actual de Spotify via su API Web y la manda a la ruleta.
 *
 * SETUP (una sola vez):
 * 1. Ir a https://developer.spotify.com/dashboard
 * 2. Crear una app → obtener CLIENT_ID y CLIENT_SECRET
 * 3. En la app, agregar Redirect URI: http://localhost:8888/callback
 * 4. Completar las variables abajo
 * 5. Correr: node scripts/spotify-now-playing.js
 * 6. Abrir http://localhost:8888/login en el navegador para autorizar
 *
 * Uso: node scripts/spotify-now-playing.js
 */

const http = require('http')
const https = require('https')
const url = require('url')

// *** COMPLETAR CON TUS DATOS DE SPOTIFY DEVELOPER ***
const CLIENT_ID = '4263b6ce31df425290d8a321d9641998'
const CLIENT_SECRET = 'b2df1e58b01b4f0e98772fe9b8c759f6'
const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const PORT = 8888

const API_URL = 'http://localhost:3000/api/now-playing'

let accessToken = null
let refreshToken = null
let lastTitle = ''

// --- Auth server ---
function startAuthServer() {
  const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true)

    if (parsed.pathname === '/login') {
      const scope = 'user-read-currently-playing user-read-playback-state'
      const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      res.writeHead(302, { Location: authUrl })
      res.end()
    } else if (parsed.pathname === '/callback') {
      const code = parsed.query.code
      if (!code) { res.end('Error: no code'); return }

      try {
        const tokens = await getTokens(code)
        accessToken = tokens.access_token
        refreshToken = tokens.refresh_token
        res.end('<h2>✅ Spotify conectado. Podés cerrar esta ventana.</h2>')
        console.log('✅ Spotify autorizado. Leyendo canción actual...')
        server.close()
        startPolling()
      } catch (e) {
        res.end('Error: ' + e.message)
      }
    } else {
      res.end('Spotify Now Playing')
    }
  })

  server.listen(PORT, () => {
    console.log(`🎵 Spotify Now Playing iniciado`)
    console.log(`   Abrí http://localhost:${PORT}/login en el navegador para autorizar`)
  })
}

function getTokens(code) {
  return new Promise((resolve, reject) => {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length,
      },
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { reject(new Error(data)) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const body = `grant_type=refresh_token&refresh_token=${refreshToken}`
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length,
      },
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          accessToken = parsed.access_token
          resolve()
        } catch { reject(new Error(data)) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function getCurrentTrack() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.spotify.com',
      path: '/v1/me/player/currently-playing',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        if (res.statusCode === 204 || !data) { resolve(null); return }
        if (res.statusCode === 401) { resolve('EXPIRED'); return }
        try {
          const parsed = JSON.parse(data)
          if (parsed.is_playing && parsed.item) {
            const track = parsed.item.name
            const artist = parsed.item.artists?.[0]?.name || ''
            resolve(artist ? `${artist} - ${track}` : track)
          } else {
            resolve(null)
          }
        } catch { resolve(null) }
      })
    })
    req.on('error', () => resolve(null))
    req.end()
  })
}

async function sendToApi(title) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
  } catch {}
}

async function startPolling() {
  const poll = async () => {
    const result = await getCurrentTrack()

    if (result === 'EXPIRED') {
      try { await refreshAccessToken() } catch {}
    } else if (result && result !== lastTitle) {
      console.log(`▶ ${result}`)
      lastTitle = result
      await sendToApi(result)
    } else if (!result && lastTitle) {
      console.log('⏹ Sin reproducción')
      lastTitle = ''
      await sendToApi('')
    }

    setTimeout(poll, 3000)
  }
  poll()
}

startAuthServer()
