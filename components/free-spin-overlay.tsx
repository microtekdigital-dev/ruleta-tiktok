'use client'

import { useEffect, useState, useRef } from 'react'

interface FreeSpinOverlayProps {
  username: string | null
  onSpin: () => void   // add free spin and continue
  onSkip: () => void  // skip and continue
}

export function FreeSpinOverlay({ username, onSpin, onSkip }: FreeSpinOverlayProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSkipRef = useRef(onSkip)
  const onSpinRef = useRef(onSpin)
  onSkipRef.current = onSkip
  onSpinRef.current = onSpin

  useEffect(() => {
    if (!username) return
    setVisible(true)
    // Auto-skip after 15 seconds if no action
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onSkipRef.current(), 400)
    }, 15000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [username])

  const handleSpin = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onSpinRef.current(), 400)
  }

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onSkipRef.current(), 400)
  }

  if (!username) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="relative text-center px-10 py-10 rounded-2xl border-2 max-w-lg w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderColor: '#f59e0b',
          boxShadow: '0 0 40px #f59e0b60, 0 0 80px #a855f730',
        }}
      >
        <div className="text-6xl mb-4">🔁</div>

        <h2
          className="text-3xl font-black mb-2"
          style={{ color: '#fbbf24', textShadow: '0 0 20px #fbbf24' }}
        >
          ¡Giro GRATIS!
        </h2>

        <p className="text-xl text-white mb-1">
          <span style={{ color: '#a855f7', fontWeight: 'bold' }}>@{username}</span>
        </p>
        <p className="text-muted-foreground mb-8">ganó un giro extra gratuito</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSpin}
            className="px-8 py-3 rounded-xl font-bold text-lg text-black transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              boxShadow: '0 0 20px #fbbf2480',
            }}
          >
            🎰 ¡Girar ahora!
          </button>
          <button
            onClick={handleSkip}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 border border-white/20 text-white/70 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            Saltar
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">Se cierra automáticamente en 15s</p>
      </div>
    </div>
  )
}
