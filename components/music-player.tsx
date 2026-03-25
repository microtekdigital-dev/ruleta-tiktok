'use client'

import { useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'

const BAR_COUNT = 12
const delays =    [0, 0.1, 0.22, 0.08, 0.35, 0.15, 0.28, 0.05, 0.42, 0.18, 0.32, 0.12]
const durations = [0.55, 0.7, 0.5, 0.65, 0.45, 0.75, 0.6, 0.5, 0.68, 0.58, 0.72, 0.48]

interface CurrentSong {
  title: string
  timestamp: number
}

interface SpinBonus {
  type: 'free' | 'double'
  username: string
}

interface MusicPlayerProps {
  spinBonus?: SpinBonus | null
}

export function MusicPlayer({ spinBonus }: MusicPlayerProps) {
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null)

  useEffect(() => {
    let active = true
    const poll = async () => {
      if (!active) return
      try {
        const res = await fetch('/api/now-playing')
        const data = await res.json()
        setCurrentSong(data.nowPlaying ?? null)
      } catch {}
      if (active) setTimeout(poll, 3000)
    }
    poll()
    return () => { active = false }
  }, [])

  return (
    <div
      className="p-4 rounded-xl bg-card/50 border border-primary/30 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 15px var(--neon-purple), inset 0 0 20px rgba(168, 85, 247, 0.1)'
      }}
    >
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-glow-gold">
        <Music2 className="w-5 h-5 text-amber-400 animate-gold-pulse" />
        Música en vivo
      </h3>

      {/* Equalizer bars */}
      <div className="flex items-end justify-center gap-[3px] h-12 px-2">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="eq-bar flex-1 rounded-sm h-full"
            style={{
              background: 'linear-gradient(to top, #a855f7, #fbbf24)',
              boxShadow: '0 0 6px #a855f7',
              animationDelay: `${delays[i]}s`,
              animationDuration: `${durations[i]}s`,
            }}
          />
        ))}
      </div>

      {/* Spin bonus indicator */}
      {spinBonus && (
        <div
          className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse"
          style={{
            background: spinBonus.type === 'free'
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${spinBonus.type === 'free' ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)'}`,
          }}
        >
          <span className="text-lg shrink-0">
            {spinBonus.type === 'free' ? '🔄' : '🎯'}
          </span>
          <div className="overflow-hidden">
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: spinBonus.type === 'free' ? '#fbbf24' : '#10b981' }}
            >
              {spinBonus.type === 'free' ? 'Giro gratis' : 'Doble turno'}
            </p>
            <p className="text-xs text-white truncate">
              ejecutando para <span className="font-bold">@{spinBonus.username}</span>
            </p>
          </div>
        </div>
      )}

      {/* Current song from WMP */}
      {currentSong && (
        <div
          className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2 overflow-hidden"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
          }}
        >
          <span className="text-lg shrink-0">🎵</span>
          <div className="overflow-hidden">
            <p
              className="text-sm font-bold text-white truncate"
              style={{ textShadow: '0 0 8px #a855f7' }}
            >
              {currentSong.title}
            </p>
            <p className="text-xs text-purple-300">reproduciendo ahora</p>
          </div>
        </div>
      )}

      {!currentSong && (
        <p className="mt-3 text-xs text-center text-muted-foreground">
          Sin reproducción activa
        </p>
      )}
    </div>
  )
}
