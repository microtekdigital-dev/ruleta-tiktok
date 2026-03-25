'use client'

import { useEffect, useState, useRef } from 'react'

interface RankingOverlayProps {
  username: string | null
  onComplete: () => void
}

export function RankingOverlay({ username, onComplete }: RankingOverlayProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onCompleteRef.current(), 400)
  }

  useEffect(() => {
    if (!username) return
    setVisible(true)
    timerRef.current = setTimeout(close, 4000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  if (!username) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 cursor-pointer ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={close}
    >
      {/* Floating rockets */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none text-4xl"
          style={{
            left: `${10 + i * 12}%`,
            bottom: '-10%',
            animation: `rocket-fly ${1.5 + i * 0.2}s ease-in infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          🚀
        </div>
      ))}

      <div className="relative text-center px-8">
        <div className="text-8xl mb-4" style={{ animation: 'rocket-pop 0.5s ease-out' }}>
          🚀
        </div>
        <h2
          className="text-5xl font-black mb-3"
          style={{ color: '#06b6d4', textShadow: '0 0 30px #06b6d4' }}
        >
          ¡Avanza en ranking!
        </h2>
        <p className="text-2xl text-white font-bold mb-2">
          <span style={{ color: '#a855f7' }}>@{username}</span>
        </p>
        <p className="text-xl text-cyan-300 animate-pulse">
          ¡Subís posiciones en el ranking!
        </p>
      </div>

      <style>{`
        @keyframes rocket-fly {
          0% { transform: translateY(0) rotate(-45deg); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(-45deg); opacity: 0; }
        }
        @keyframes rocket-pop {
          0% { transform: scale(0) rotate(-45deg); }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
