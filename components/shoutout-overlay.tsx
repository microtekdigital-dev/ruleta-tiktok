'use client'

import { useEffect, useState } from 'react'

interface ShoutoutOverlayProps {
  username: string | null
  avatarUrl: string | null
  onComplete: () => void
}

export function ShoutoutOverlay({ username, avatarUrl, onComplete }: ShoutoutOverlayProps) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
    if (!username) return
    const t = setTimeout(() => onComplete(), 6000)
    return () => clearTimeout(t)
  }, [username, onComplete])

  if (!username) return null

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl border-2 animate-in fade-in zoom-in-95 duration-500"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderColor: '#a855f7',
          boxShadow: '0 0 60px #a855f780, 0 0 120px #a855f740',
        }}
      >
        {/* Glow ring around avatar */}
        <div
          className="relative rounded-full p-1"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)' }}
        >
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-28 h-28 rounded-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#a855f7' }}>
            ✨ Shoutout ✨
          </p>
          <p className="text-3xl font-black text-white">@{username}</p>
          <p className="text-sm text-muted-foreground mt-1">¡Gracias por el regalo!</p>
        </div>
      </div>
    </div>
  )
}
