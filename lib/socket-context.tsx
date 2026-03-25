'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { GiftEvent, SpinResult, LeaderboardEntry, Prize } from './game-store'
import { DEFAULT_PRIZES, selectPrize, calculateSpinAngle, generateId } from './game-store'

interface GameState {
  isSpinning: boolean
  targetAngle: number
  currentRotation: number
  prizes: Prize[]
  lastResult: SpinResult | null
  pendingResult: SpinResult | null  // set at spin start, read by canvas
  spinQueue: GiftEvent[]
  leaderboard: LeaderboardEntry[]
  activeGifts: GiftEvent[]
  autoSpin: boolean
  showConfetti: boolean
  isConnected: boolean
}

interface SocketContextType {
  gameState: GameState
  sendGift: (username: string, giftType: 'rose' | 'big') => void
  updatePrizes: (prizes: Prize[]) => void
  toggleAutoSpin: () => void
  clearGift: (id: string) => void
  processNextSpin: () => void
  correctLastResult: (prize: Prize) => void
  updateRotation: (rotation: number) => void
  addFreeSpin: (username: string) => void
  addDoubleTurn: (username: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Procedural sound generator using Web Audio API
function createProceduralSounds() {
  let audioContext: AudioContext | null = null

  const getContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    return audioContext
  }

  const playSpinSound = () => {
    try {
      const ctx = getContext()
      // Create a series of tick sounds that slow down
      const ticks = 20
      for (let i = 0; i < ticks; i++) {
        const delay = i * 0.05 + (i * i * 0.01) // Accelerating delay
        setTimeout(() => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = 800 + Math.random() * 200
          gain.gain.setValueAtTime(0.1, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + 0.05)
        }, delay * 1000)
      }
    } catch {
      // Ignore errors
    }
  }

  const playWinSound = () => {
    try {
      const ctx = getContext()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.value = freq

        const startTime = ctx.currentTime + i * 0.15
        gainNode.gain.setValueAtTime(0.2, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.5)
      })
    } catch {
      // Ignore errors
    }
  }

  return { playSpinSound, playWinSound }
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    targetAngle: 0,
    currentRotation: 0,
    prizes: DEFAULT_PRIZES,
    lastResult: null,
    pendingResult: null,
    spinQueue: [],
    leaderboard: [],
    activeGifts: [],
    autoSpin: true,
    showConfetti: false,
    isConnected: false,
  })

  const soundsRef = useRef<ReturnType<typeof createProceduralSounds> | null>(null)
  const processingRef = useRef(false)

  // Initialize sounds on client
  useEffect(() => {
    soundsRef.current = createProceduralSounds()
  }, [])

  // Cargar leaderboard desde DB al iniciar
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (data.leaderboard?.length) {
          setGameState(prev => ({ ...prev, leaderboard: data.leaderboard }))
        }
      })
      .catch(() => {})
  }, [])

  const initializedRef = useRef(false)
  const processedIdsRef = useRef(new Set<string>())

  // Poll for gifts from API
  useEffect(() => {
    // Use localStorage to persist the last processed timestamp across page reloads
    const getLastTimestamp = (): number => {
      try {
        return parseInt(localStorage.getItem('roulette_last_ts') || '0', 10)
      } catch { return 0 }
    }
    const saveLastTimestamp = (ts: number) => {
      try { localStorage.setItem('roulette_last_ts', String(ts)) } catch {}
    }

    // Load all history for leaderboard, but only spin for gifts after last saved timestamp
    const spinCutoff = getLastTimestamp()
    let lastTimestamp = 0
    let isActive = true
    const processedIds = new Set<string>()

    const pollGifts = async () => {
      if (!isActive) return

      try {
        const response = await fetch(`/api/gift?since=${lastTimestamp}`)
        const data = await response.json()

        if (data.gifts && data.gifts.length > 0) {
          data.gifts.forEach((gift: { id: string; username: string; giftType: 'rose' | 'big'; timestamp: number }) => {
            if (processedIds.has(gift.id)) return
            processedIds.add(gift.id)

            const giftEvent: GiftEvent = {
              id: gift.id,
              username: gift.username,
              giftType: gift.giftType,
              giftName: gift.giftName,
              giftEmoji: gift.giftEmoji,
              avatarUrl: gift.avatarUrl,
              timestamp: gift.timestamp,
            }

            setGameState(prev => {
              const existingEntry = prev.leaderboard.find(e => e.username === giftEvent.username)
              const newLeaderboard = existingEntry
                ? prev.leaderboard.map(e =>
                    e.username === giftEvent.username ? { ...e, giftCount: e.giftCount + 1 } : e
                  )
                : [...prev.leaderboard, { username: giftEvent.username, giftCount: 1 }]

              // Only spin for gifts newer than what was already processed before reload
              if (gift.timestamp <= spinCutoff) {
                return { ...prev, leaderboard: newLeaderboard, isConnected: true }
              }

              const newActiveGifts = [...prev.activeGifts, giftEvent]
              if (prev.spinQueue.length >= 8) {
                return { ...prev, leaderboard: newLeaderboard, isConnected: true }
              }
              const newQueue = giftEvent.giftType === 'big'
                ? [giftEvent, ...prev.spinQueue]
                : [...prev.spinQueue, giftEvent]

              return {
                ...prev,
                spinQueue: newQueue,
                leaderboard: newLeaderboard,
                activeGifts: newActiveGifts,
                isConnected: true,
              }
            })

            // Save the latest processed timestamp
            if (gift.timestamp > spinCutoff) {
              saveLastTimestamp(gift.timestamp)
            }
          })

          lastTimestamp = data.timestamp
        }

        setGameState(prev => ({ ...prev, isConnected: true }))
      } catch (err) {
        console.error('[v0] Poll error:', err)
        setGameState(prev => ({ ...prev, isConnected: false }))
      }

      if (isActive) {
        setTimeout(pollGifts, 500)
      }
    }

    pollGifts()

    return () => {
      isActive = false
    }
  }, [])

  // Persistir leaderboard en DB cuando cambia
  useEffect(() => {
    if (gameState.leaderboard.length === 0) return
    const t = setTimeout(() => {
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard: gameState.leaderboard }),
      }).catch(() => {})
    }, 2000)
    return () => clearTimeout(t)
  }, [gameState.leaderboard])

  // Giro aleatorio cada 60 segundos si no hay cola ni giro activo
  useEffect(() => {
    const FALLBACK_NAMES = ['Usuario1', 'Jugador22', 'Fan99', 'Estrella7', 'Lucky13', 'Campeón5']
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.isSpinning || prev.spinQueue.length > 0) return prev
        // Usar nombre del leaderboard o fallback aleatorio
        const pool = prev.leaderboard.length > 0
          ? prev.leaderboard.map(e => e.username)
          : FALLBACK_NAMES
        const randomUsername = pool[Math.floor(Math.random() * pool.length)]
        // Agregar a la cola para que siga el flujo normal
        const autoEvent: GiftEvent = {
          id: generateId(),
          username: randomUsername,
          giftType: 'rose',
          timestamp: Date.now(),
        }
        return { ...prev, spinQueue: [...prev.spinQueue, autoEvent] }
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-process spin queue when gifts arrive
  useEffect(() => {
    if (gameState.autoSpin && gameState.spinQueue.length > 0 && !gameState.isSpinning && !processingRef.current) {
      processingRef.current = true
      const timer = setTimeout(() => {
        setGameState(prev => {
          if (prev.isSpinning || prev.spinQueue.length === 0) {
            processingRef.current = false
            return prev
          }

          const [nextGift, ...remainingQueue] = prev.spinQueue
          const selectedPrize = selectPrize(prev.prizes)
          const prizeIndex = prev.prizes.findIndex(p => p.id === selectedPrize.id)
          const angle = calculateSpinAngle(prizeIndex, prev.prizes.length, prev.currentRotation)

          soundsRef.current?.playSpinSound()

          const result: SpinResult = {
            username: nextGift.username,
            prize: selectedPrize,
            timestamp: Date.now(),
          }

          return {
            ...prev,
            isSpinning: true,
            targetAngle: angle,
            spinQueue: remainingQueue,
            showConfetti: false,
            pendingResult: result,
            lastResult: result,
          }
        })
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [gameState.autoSpin, gameState.spinQueue.length, gameState.isSpinning])

  const playSpinSound = useCallback(() => {
    soundsRef.current?.playSpinSound()
  }, [])

  const playWinSound = useCallback(() => {
    soundsRef.current?.playWinSound()
  }, [])

  const startNextSpin = useCallback(() => {
    setGameState(prev => {
      if (prev.isSpinning || prev.spinQueue.length === 0) {
        return prev
      }

      const [nextGift, ...remainingQueue] = prev.spinQueue
      const selectedPrize = selectPrize(prev.prizes)
      const prizeIndex = prev.prizes.findIndex(p => p.id === selectedPrize.id)
      const angle = calculateSpinAngle(prizeIndex, prev.prizes.length, prev.currentRotation)

      const result: SpinResult = {
        username: nextGift.username,
        prize: selectedPrize,
        timestamp: Date.now(),
      }

      return {
        ...prev,
        isSpinning: true,
        targetAngle: angle,
        spinQueue: remainingQueue,
        showConfetti: false,
        pendingResult: result,
        lastResult: result,
      }
    })
    
    // Play spin sound after state update
    playSpinSound()
  }, [playSpinSound])

  const handleSpinComplete = useCallback(() => {
    processingRef.current = false

    setGameState(prev => {
      const isWin = prev.lastResult && prev.lastResult.prize.label !== 'Seguí intentando'
      if (isWin) {
        setTimeout(() => playWinSound(), 200)
      }
      return {
        ...prev,
        isSpinning: false,
        showConfetti: isWin || false,
      }
    })

    setTimeout(() => {
      setGameState(prev => ({ ...prev, showConfetti: false }))
    }, 3000)
  }, [playWinSound])

  const sendGift = useCallback((username: string, giftType: 'rose' | 'big') => {
    const giftEvent: GiftEvent = {
      id: generateId(),
      username,
      giftType,
      timestamp: Date.now(),
    }

    setGameState(prev => {
      // Update leaderboard
      const existingEntry = prev.leaderboard.find(e => e.username === username)
      const newLeaderboard = existingEntry
        ? prev.leaderboard.map(e =>
            e.username === username ? { ...e, giftCount: e.giftCount + 1 } : e
          )
        : [...prev.leaderboard, { username, giftCount: 1 }]

      // Add to active gifts for notification
      const newActiveGifts = [...prev.activeGifts, giftEvent]

      // Add to spin queue (big gifts get priority), max 8 users
      if (prev.spinQueue.length >= 8) {
        return { ...prev, leaderboard: newLeaderboard, activeGifts: newActiveGifts }
      }
      const newQueue = giftType === 'big'
        ? [giftEvent, ...prev.spinQueue]
        : [...prev.spinQueue, giftEvent]

      return {
        ...prev,
        spinQueue: newQueue,
        leaderboard: newLeaderboard,
        activeGifts: newActiveGifts,
      }
    })

    // Auto-start spinning if not already
    setTimeout(() => {
      setGameState(prev => {
        if (prev.autoSpin && !prev.isSpinning && prev.spinQueue.length > 0) {
          const [nextGift, ...remainingQueue] = prev.spinQueue
          const selectedPrize = selectPrize(prev.prizes)
          const prizeIndex = prev.prizes.findIndex(p => p.id === selectedPrize.id)
          const angle = calculateSpinAngle(prizeIndex, prev.prizes.length, prev.currentRotation)

          playSpinSound()

          const result: SpinResult = {
            username: nextGift.username,
            prize: selectedPrize,
            timestamp: Date.now(),
          }

          return {
            ...prev,
            isSpinning: true,
            targetAngle: angle,
            spinQueue: remainingQueue,
            showConfetti: false,
            pendingResult: result,
            lastResult: result,
          }
        }
        return prev
      })
    }, 500)
  }, [playSpinSound])

  const updatePrizes = useCallback((prizes: Prize[]) => {
    setGameState(prev => ({ ...prev, prizes }))
  }, [])

  const toggleAutoSpin = useCallback(() => {
    setGameState(prev => ({ ...prev, autoSpin: !prev.autoSpin }))
  }, [])

  const clearGift = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      activeGifts: prev.activeGifts.filter(g => g.id !== id),
    }))
  }, [])

  const updateRotation = useCallback((rotation: number) => {
    setGameState(prev => ({ ...prev, currentRotation: rotation }))
  }, [])

  const addFreeSpin = useCallback((username: string) => {
    const freeSpinEvent: GiftEvent = {
      id: generateId(),
      username,
      giftType: 'rose',
      timestamp: Date.now(),
    }
    setGameState(prev => ({
      ...prev,
      spinQueue: [freeSpinEvent, ...prev.spinQueue],
    }))
  }, [])

  const addDoubleTurn = useCallback((username: string) => {
    const spin1: GiftEvent = { id: generateId(), username, giftType: 'rose', timestamp: Date.now() }
    const spin2: GiftEvent = { id: generateId(), username, giftType: 'rose', timestamp: Date.now() + 1 }
    setGameState(prev => ({
      ...prev,
      spinQueue: [spin1, spin2, ...prev.spinQueue],
    }))
  }, [])

  const correctLastResult = useCallback((prize: Prize) => {
    setGameState(prev => ({
      ...prev,
      lastResult: prev.lastResult ? { ...prev.lastResult, prize } : prev.lastResult,
    }))
  }, [])

  const contextValue: SocketContextType = {
    gameState: { ...gameState },
    sendGift,
    updatePrizes,
    toggleAutoSpin,
    clearGift,
    processNextSpin: handleSpinComplete,
    correctLastResult,
    updateRotation,
    addFreeSpin,
    addDoubleTurn,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

