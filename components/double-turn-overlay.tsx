'use client'

import { useEffect, useState, useRef } from 'react'

interface DoubleTurnOverlayProps {
  username: string | null
  onComplete: () => void
}

export function DoubleTurnOverlay({ username, onComplete }: DoubleTurnOverlayProps) {
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
      <div className="text-center px-6 max-w-[500px] w-full">
        <div className="text-6xl mb-3" style={{ animation: 'bounce-in 0.5s ease-out' }}>🎯</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#10b981', textShadow: '0 0 30px #10b981' }}>
          ¡Doble turno!
        </h2>
        <p className="text-xl text-white font-bold mb-1">
          <span style={{ color: '#a855f7' }}>@{username}</span>
        </p>
        <p className="text-base text-emerald-300 animate-pulse">¡Girás 2 veces seguidas!</p>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
