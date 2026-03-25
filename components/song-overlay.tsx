'use client'

import { useEffect, useState, useRef } from 'react'

interface SongOverlayProps {
  username: string | null
  onComplete: () => void
}

export function SongOverlay({ username, onComplete }: SongOverlayProps) {
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
    timerRef.current = setTimeout(close, 8000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  if (!username) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 cursor-pointer ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={close}
    >
      {/* Floating notes */}
      {['🎵', '🎶', '🎵', '🎶', '🎵', '🎶'].map((note, i) => (
        <div
          key={i}
          className="absolute pointer-events-none text-4xl"
          style={{
            left: `${10 + i * 15}%`,
            bottom: '-5%',
            animation: `note-float ${2 + i * 0.3}s ease-in infinite`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.7,
          }}
        >
          {note}
        </div>
      ))}

      <div className="relative text-center px-6 max-w-[500px] w-full">
        <div className="text-6xl mb-3" style={{ animation: 'pop-in 0.5s ease-out' }}>🎧</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#8b5cf6', textShadow: '0 0 30px #8b5cf6' }}>
          ¡Ponés una canción!
        </h2>
        <p className="text-xl text-white font-bold mb-3">
          <span style={{ color: '#fbbf24' }}>@{username}</span>
        </p>
        <div
          className="px-4 py-3 rounded-2xl text-base font-semibold text-white animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #4c1d95, #5b21b6)',
            border: '2px solid #8b5cf6',
            boxShadow: '0 0 30px #8b5cf660',
          }}
        >
          🎤 ¿Qué canción querés?
          <br />
          <span className="text-purple-300 text-sm font-normal">¡Dejalo en los comentarios!</span>
        </div>
      </div>

      <style>{`
        @keyframes note-float {
          0% { transform: translateY(0) rotate(-10deg); opacity: 0.7; }
          100% { transform: translateY(-110vh) rotate(10deg); opacity: 0; }
        }
        @keyframes pop-in {
          0% { transform: scale(0); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
