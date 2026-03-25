'use client'

import { useEffect, useState } from 'react'

interface BigGiftEffectProps {
  username: string | null
  onComplete: () => void
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  emoji: ['⭐', '💫', '✨', '🌟', '💎', '👑', '🔥', '💥'][i % 8],
  left: `${Math.random() * 100}%`,
  delay: `${(Math.random() * 1.5).toFixed(2)}s`,
  duration: `${(1.5 + Math.random() * 1.5).toFixed(2)}s`,
  size: `${1.5 + Math.random() * 2}rem`,
}))

export function BigGiftEffect({ username, onComplete }: BigGiftEffectProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!username) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 600)
    }, 4000)
    return () => clearTimeout(t)
  }, [username])

  if (!username) return null

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}
    >
      {/* Radial flash */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.25) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)',
          animation: 'big-gift-flash 0.5s ease-out',
        }}
      />

      {/* Falling particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            fontSize: p.size,
            animation: `big-gift-fall ${p.duration} ease-in forwards`,
            animationDelay: p.delay,
            opacity: 0,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Center banner */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'big-gift-banner 4s ease forwards' }}
      >
        <div
          className="text-center px-10 py-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(22,33,62,0.95))',
            border: '2px solid #fbbf24',
            boxShadow: '0 0 60px #fbbf24, 0 0 120px #a855f7',
          }}
        >
          <div className="text-6xl mb-2" style={{ animation: 'big-gift-pop 0.5s ease-out 0.2s both' }}>
            💎
          </div>
          <p className="text-3xl font-black mb-1" style={{ color: '#fbbf24', textShadow: '0 0 20px #fbbf24' }}>
            ¡REGALO GRANDE!
          </p>
          <p className="text-xl text-white font-bold">
            <span style={{ color: '#a855f7' }}>@{username}</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes big-gift-fall {
          0%   { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes big-gift-flash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes big-gift-banner {
          0%   { opacity: 0; transform: scale(0.5); }
          10%  { opacity: 1; transform: scale(1.05); }
          15%  { transform: scale(1); }
          80%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        @keyframes big-gift-pop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
