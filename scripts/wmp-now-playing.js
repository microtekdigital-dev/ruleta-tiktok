/**
 * wmp-now-playing.js
 * Lee la canción actual de Windows Media Player via PowerShell (COM)
 * y la envía a la API cada 3 segundos.
 *
 * Uso: node scripts/wmp-now-playing.js
 * Requiere: Node.js en Windows con WMP abierto
 */

const { execSync } = require('child_process')
const path = require('path')

// Cambia esto si tu app corre en otro puerto
const API_URL = 'http://localhost:3000/api/now-playing'

// Ruta al script PS1
const PS1_PATH = path.join(__dirname, 'get-wmp-title.ps1')

let lastTitle = ''

function getNowPlaying() {
  try {
    const result = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${PS1_PATH}"`,
      { timeout: 4000, encoding: 'utf8' }
    ).trim()
    return result || null
  } catch {
    return null
  }
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
  const title = getNowPlaying()

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

console.log('🎵 WMP Now Playing iniciado. Conectando a', API_URL)
poll()
