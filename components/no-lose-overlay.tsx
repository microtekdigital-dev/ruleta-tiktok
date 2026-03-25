'use client'

import { useEffect, useState, useRef } from 'react'

interface NoLoseOverlayProps {
  username: string | null
  onComplete: () => void
}

export function NoLoseOverlay({ username, onComplete }: NoLoseOverlayProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const playEncouragement = () => {
    try {
      const ctx = new AudioContext()
      // Ascending cheerful melody
      const notes = [392, 440, 494, 523, 587, 659]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.15
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.18, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.start(t)
        osc.stop(t + 0.4)
      })
      // Crowd murmur underneath
      const bufferSize = ctx.sampleRate * 1.5
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate
        data[i] = (Math.random() * 2 - 1) * Math.min(t * 2, 1) * Math.max(1 - t / 1.5, 0) * 0.08
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1200
      filter.Q.value = 0.8
      noise.connect(filter)
      filter.connect(ctx.destination)
      noise.start()
      noise.onended = () => ctx.close()
    } catch {}
  }

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onCompleteRef.current(), 400)
  }

  useEffect(() => {
    if (!username) return
    setVisible(true)
    playEncouragement()
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
        <div className="text-6xl mb-3" style={{ animation: 'trophy-spin 0.6s ease-out' }}>🏆</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#f97316', textShadow: '0 0 30px #f97316' }}>
          ¡Ánimo!
        </h2>
        <p className="text-xl text-white font-bold mb-1">
          <span style={{ color: '#fbbf24' }}>@{username}</span>
        </p>
        <p className="text-base text-orange-300 animate-pulse">La próxima ganás 💪</p>
      </div>
      <style>{`
        @keyframes trophy-spin {
          0% { transform: scale(0) rotate(-180deg); }
          70% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
