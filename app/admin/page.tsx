'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Gem, Settings, Trash2, Plus, Zap, ClipboardList, MessageSquare } from 'lucide-react'
import { DEFAULT_PRIZES, type Prize } from '@/lib/game-store'
import { PinCommentOverlay } from '@/components/pin-comment-overlay'
import { FreeSpinOverlay } from '@/components/free-spin-overlay'
import type { SpinLogEntry } from '@/app/api/spin-log/route'

const RANDOM_USERNAMES = [
  'GamerPro123', 'StreamFan99', 'LuckyPlayer', 'NightOwl22', 'StarGazer',
  'MoonWalker', 'SunnyDay', 'CoolCat77', 'HappyVibes', 'TikTokStar'
]

function getRandomUsername() {
  return RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)]
}

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [autoSpin, setAutoSpin] = useState(true)
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES)
  const [lastResponse, setLastResponse] = useState<string | null>(null)
  const [pinCommentUsername, setPinCommentUsername] = useState<string | null>(null)
  const [freeSpinUsername, setFreeSpinUsername] = useState<string | null>(null)
  const [songUsername, setSongUsername] = useState<string | null>(null)
  const [songTitle, setSongTitle] = useState('')
  const [spinLogs, setSpinLogs] = useState<SpinLogEntry[]>([])
  const [challengeWord, setChallengeWord] = useState('')
  const [activeChallengeWord, setActiveChallengeWord] = useState<string | null>(null)

  // Poll for pin comment notifications
  useEffect(() => {
    let isActive = true
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/pin-comment')
        const data = await res.json()
        if (data.pending) {
          setPinCommentUsername(data.pending.username)
          await fetch('/api/pin-comment', { method: 'DELETE' })
        }
      } catch {}
      if (isActive) setTimeout(poll, 1000)
    }
    poll()
    return () => { isActive = false }
  }, [])

  // Poll for free spin notifications
  useEffect(() => {
    let isActive = true
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/free-spin')
        const data = await res.json()
        if (data.pending) {
          setFreeSpinUsername(data.pending.username)
          await fetch('/api/free-spin', { method: 'DELETE' })
        }
      } catch {}
      if (isActive) setTimeout(poll, 1000)
    }
    poll()
    return () => { isActive = false }
  }, [])

  // Poll for song request notifications
  useEffect(() => {
    let isActive = true
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/song-request')
        const data = await res.json()
        if (data.pending) {
          setSongUsername(data.pending.username)
          await fetch('/api/song-request', { method: 'DELETE' })
        }
      } catch {}
      if (isActive) setTimeout(poll, 1000)
    }
    poll()
    return () => { isActive = false }
  }, [])

  // Poll spin logs every 2s
  useEffect(() => {
    let isActive = true
    const fetchLogs = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/spin-log')
        const data = await res.json()
        if (data.logs) setSpinLogs(data.logs)
      } catch {}
      if (isActive) setTimeout(fetchLogs, 2000)
    }
    fetchLogs()
    return () => { isActive = false }
  }, [])

  // Poll word challenge state
  useEffect(() => {
    let isActive = true
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/word-challenge')
        const data = await res.json()
        setActiveChallengeWord(data.challenge?.word ?? null)
      } catch {}
      if (isActive) setTimeout(poll, 1500)
    }
    poll()
    return () => { isActive = false }
  }, [])

  const startChallenge = async () => {
    if (!challengeWord.trim()) return
    await fetch('/api/word-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: challengeWord.trim() }),
    })
    setActiveChallengeWord(challengeWord.trim().toLowerCase())
    setChallengeWord('')
  }

  const cancelChallenge = async () => {
    await fetch('/api/word-challenge', { method: 'DELETE' })
    setActiveChallengeWord(null)
  }

  const sendGift = useCallback(async (giftType: 'rose' | 'big', customUsername?: string) => {
    setIsLoading(true)
    const finalUsername = customUsername || username || getRandomUsername()

    try {
      const response = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: finalUsername,
          gift: giftType,
        }),
      })

      const data = await response.json()
      setLastResponse(JSON.stringify(data, null, 2))

      if (!customUsername && !username) {
        setUsername('')
      }
    } catch (error) {
      setLastResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [username])

  const sendMultipleGifts = useCallback(async (count: number) => {
    setIsLoading(true)
    for (let i = 0; i < count; i++) {
      await sendGift('rose', getRandomUsername())
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    setIsLoading(false)
  }, [sendGift])

  const updatePrizeWeight = (id: string, weight: number) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, weight: Math.max(0, weight) } : p))
  }

  const updatePrizeLabel = (id: string, label: string) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, label } : p))
  }

  const updatePrizeEmoji = (id: string, emoji: string) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, emoji } : p))
  }

  const removePrize = (id: string) => {
    if (prizes.length > 2) {
      setPrizes(prev => prev.filter(p => p.id !== id))
    }
  }

  const addPrize = () => {
    const newPrize: Prize = {
      id: Math.random().toString(36).substring(7),
      label: 'Nuevo Premio',
      emoji: '\u2b50',
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      weight: 10,
    }
    setPrizes(prev => [...prev, newPrize])
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <PinCommentOverlay
        username={pinCommentUsername}
        onComplete={() => setPinCommentUsername(null)}
      />
      <FreeSpinOverlay
        username={freeSpinUsername}
        onSpin={async () => {
          if (freeSpinUsername) {
            await fetch('/api/free-spin-trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: freeSpinUsername }),
            })
          }
          setFreeSpinUsername(null)
        }}
        onSkip={() => setFreeSpinUsername(null)}
      />
      {/* Song request notification */}
      {songUsername && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="text-center px-10 py-8 rounded-2xl border-2 max-w-md w-full mx-4"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              borderColor: '#8b5cf6',
              boxShadow: '0 0 40px #8b5cf660',
            }}
          >
            <div className="text-5xl mb-3">🎧</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#8b5cf6' }}>
              ¡Canción ganada!
            </h2>
            <p className="text-xl text-white mb-1">
              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>@{songUsername}</span>
            </p>
            <p className="text-muted-foreground mb-4">ganó el premio de poner una canción</p>
            <Input
              placeholder="Nombre de la canción elegida..."
              value={songTitle}
              onChange={e => setSongTitle(e.target.value)}
              className="mb-4 text-center"
              onKeyDown={async e => {
                if (e.key === 'Enter' && songTitle.trim()) {
                  await fetch('/api/song-request', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: songUsername, title: songTitle.trim() }),
                  })
                  setSongUsername(null)
                  setSongTitle('')
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (songTitle.trim()) {
                    await fetch('/api/song-request', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: songUsername, title: songTitle.trim() }),
                    })
                  }
                  setSongUsername(null)
                  setSongTitle('')
                }}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
              >
                {songTitle.trim() ? 'Guardar canción' : 'Omitir'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-glow-purple">Panel de Admin</h1>
          <p className="text-muted-foreground">Controla la Ruleta de Regalos</p>
          <a href="/" className="text-primary hover:underline text-sm">
            {'Volver al overlay'}
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gift Simulation */}
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Simular Regalos
              </CardTitle>
              <CardDescription>
                Enviar regalos de prueba para activar la ruleta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de Usuario</label>
                <Input
                  placeholder="Dejar en blanco para aleatorio"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => sendGift('rose')}
                  disabled={isLoading}
                  className="flex-1 glow-purple"
                >
                  {'\ud83c\udf39'} Enviar Rosa
                </Button>
                <Button
                  onClick={() => sendGift('big')}
                  disabled={isLoading}
                  variant="secondary"
                  className="flex-1 glow-gold"
                >
                  <Gem className="w-4 h-4" />
                  Regalo Grande
                </Button>
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-sm text-muted-foreground mb-2">Prueba de carga:</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => sendMultipleGifts(3)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Zap className="w-4 h-4" />
                    3 Rosas
                  </Button>
                  <Button
                    onClick={() => sendMultipleGifts(5)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Zap className="w-4 h-4" />
                    5 Rosas
                  </Button>
                  <Button
                    onClick={() => sendMultipleGifts(10)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Zap className="w-4 h-4" />
                    10 Rosas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configuraci&oacute;n
              </CardTitle>
              <CardDescription>
                Ajustes generales del juego
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-spin</p>
                  <p className="text-sm text-muted-foreground">
                    Girar autom&aacute;ticamente al recibir regalo
                  </p>
                </div>
                <Switch
                  checked={autoSpin}
                  onCheckedChange={setAutoSpin}
                />
              </div>

              {lastResponse && (
                <div className="border-t border-border/50 pt-4">
                  <p className="text-sm font-medium mb-2">&Uacute;ltima respuesta:</p>
                  <pre className="text-xs bg-muted/50 p-2 rounded-md overflow-auto max-h-32">
                    {lastResponse}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prize Editor */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{'\ud83c\udfb0'}</span>
              Editar Premios
            </CardTitle>
            <CardDescription>
              Personaliza los premios y sus probabilidades (peso mayor = m&aacute;s probable)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <Input
                    value={prize.emoji}
                    onChange={(e) => updatePrizeEmoji(prize.id, e.target.value)}
                    className="w-16 text-center text-xl"
                  />
                  <Input
                    value={prize.label}
                    onChange={(e) => updatePrizeLabel(prize.id, e.target.value)}
                    className="flex-1"
                    placeholder="Nombre del premio"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">Peso:</label>
                    <Input
                      type="number"
                      value={prize.weight}
                      onChange={(e) => updatePrizeWeight(prize.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={0}
                    />
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-foreground/20"
                    style={{ backgroundColor: prize.color }}
                    title={prize.color}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrize(prize.id)}
                    disabled={prizes.length <= 2}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={addPrize}
              variant="outline"
              className="w-full mt-4"
            >
              <Plus className="w-4 h-4" />
              Agregar Premio
            </Button>

            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-200">
                <strong>Nota:</strong> Los cambios en premios solo se aplican localmente en esta p&aacute;gina. 
                Para aplicar a la ruleta principal, se requiere implementar persistencia (base de datos o API).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TikTok Integration Info */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Conectar con TikTok Live</CardTitle>
            <CardDescription>
              Instrucciones para conectar con tu stream de TikTok
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Opci&oacute;n 1: TikTok Live Connector</h4>
              <p className="text-sm text-muted-foreground">
                Usa una herramienta como <code className="bg-muted px-1 rounded">tiktok-live-connector</code> para 
                capturar eventos de regalos y enviarlos a nuestra API:
              </p>
              <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto">
{`POST /api/gift
Content-Type: application/json

{
  "username": "usuario_tiktok",
  "gift": "rose"
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Opci&oacute;n 2: Webhook Manual</h4>
              <p className="text-sm text-muted-foreground">
                Configura un webhook que llame a nuestra API cuando se reciba un regalo.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Opci&oacute;n 3: Prueba Local</h4>
              <p className="text-sm text-muted-foreground">
                Usa los botones de arriba para simular regalos y probar el overlay.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Word Challenge */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Desafío de palabra
            </CardTitle>
            <CardDescription>
              El primero en escribir la palabra en el chat gana un giro gratis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeChallengeWord ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/40">
                <div>
                  <p className="text-xs text-amber-400 font-bold uppercase">Desafío activo</p>
                  <p className="text-lg font-black text-white mt-0.5">&ldquo;{activeChallengeWord}&rdquo;</p>
                </div>
                <Button variant="destructive" size="sm" onClick={cancelChallenge}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Palabra clave (ej: fuego)"
                  value={challengeWord}
                  onChange={e => setChallengeWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startChallenge()}
                />
                <Button onClick={startChallenge} disabled={!challengeWord.trim()}>
                  Activar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spin Logs */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Historial de giros
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive text-xs"
                onClick={async () => {
                  await fetch('/api/spin-log', { method: 'DELETE' })
                  setSpinLogs([])
                }}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Limpiar
              </Button>
            </CardTitle>
            <CardDescription>
              Registro de todos los giros con usuario, premio y fecha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {spinLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin registros aún...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {spinLogs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border/40"
                  >
                    <span className="text-xl">{log.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">@{log.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.prize}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
