'use client'

import { useEffect, useState, useRef } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  color: string
  angle: number
  speed: number
}

interface MentionOverlayProps {
  username: string | null
  onComplete: () => void
}

const COLORS = ['#fbbf24', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f97316']

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * 360,
    speed: Math.random() * 2 + 1,
  }))
}

export function MentionOverlay({ username, onComplete }: MentionOverlayProps) {
  const [stars] = useState<Star[]>(() => generateStars(30))
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const playApplause = () => {
    try {
      const ctx = new AudioContext()
      const duration = 3.5
      const bufferSize = ctx.sampleRate * duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        const burst = Math.sin(t * 6) * 0.5 + 0.5
        const envelope = Math.min(t * 2, 1) * Math.max(1 - (t - 2.5) / 1, 0)
        data[i] = (Math.random() * 2 - 1) * burst * envelope * 0.4
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 2000
      filter.Q.value = 0.5
      source.connect(filter)
      filter.connect(ctx.destination)
      source.start()
      source.onended = () => ctx.close()
    } catch {}
  }

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onCompleteRef.current(), 500)
  }

  useEffect(() => {
    if (!username) return
    setVisible(true)
    playApplause()
    timerRef.current = setTimeout(close, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  if (!username) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 cursor-pointer ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={close}
    >
      {/* Exploding stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: `${star.size}px`,
            color: star.color,
            animation: `star-explode ${star.speed}s ease-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            filter: `drop-shadow(0 0 6px ${star.color})`,
          }}
        >
          ⭐
        </div>
      ))}

      {/* Username display */}
      <div className="relative text-center px-6 max-w-[500px] w-full">
        <p className="text-lg text-amber-300 mb-2 font-semibold" style={{ textShadow: '0 0 10px #fbbf24' }}>
          📣 ¡Mencionar cuenta!
        </p>
        <div
          className="text-5xl font-black break-all"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #a855f7, #ec4899, #fbbf24)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-shift 1s ease infinite, text-blink 0.5s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px #fbbf24)',
          }}
        >
          @{username}
        </div>
        <p className="text-base text-purple-300 mt-3 animate-pulse">
          ¡Mencioná esta cuenta varias veces!
        </p>
      </div>

      <style>{`
        @keyframes star-explode {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0.5) rotate(360deg) translate(30px, -30px); opacity: 0; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes text-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
