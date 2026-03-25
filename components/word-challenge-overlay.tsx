'use client'

import { useEffect, useState } from 'react'

interface WordChallengeOverlayProps {
  word: string | null
  winner: string | null
  onWinnerClaimed: () => void
}

export function WordChallengeOverlay({ word, winner, onWinnerClaimed }: WordChallengeOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (word || winner) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [word, winner])

  useEffect(() => {
    if (winner) {
      const t = setTimeout(() => {
        setVisible(false)
        onWinnerClaimed()
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [winner, onWinnerClaimed])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 text-center px-6 py-4 rounded-2xl border-2 animate-in fade-in slide-in-from-bottom-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderColor: winner ? '#22c55e' : '#f59e0b',
        boxShadow: `0 0 30px ${winner ? '#22c55e60' : '#f59e0b60'}`,
        minWidth: '260px',
      }}
    >
      {winner ? (
        <>
          <div className="text-3xl mb-1">🎉</div>
          <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider">¡Ganador!</p>
          <p className="text-xl font-black text-white mt-1">@{winner}</p>
          <p className="text-xs text-muted-foreground mt-1">Ganó un giro gratis</p>
        </>
      ) : (
        <>
          <div className="text-2xl mb-1">⌨️</div>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Desafío activo</p>
          <p className="text-sm text-muted-foreground mt-1">El primero en escribir</p>
          <p
            className="text-2xl font-black mt-1 tracking-widest"
            style={{ color: '#f59e0b', textShadow: '0 0 15px #f59e0b' }}
          >
            &ldquo;{word}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-1">gana un giro gratis 🎰</p>
        </>
      )}
    </div>
  )
}
