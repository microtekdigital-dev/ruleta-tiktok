'use client'

import { useEffect, useState, useRef } from 'react'

interface PinCommentOverlayProps {
  username: string | null
  onComplete: () => void
}

export function PinCommentOverlay({ username, onComplete }: PinCommentOverlayProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const commentText = username
    ? `📌 ¡@${username} ganó comentario fijado en el directo! 🌹 ¡Gracias por tu apoyo!`
    : ''

  useEffect(() => {
    if (!username) return
    setVisible(true)
    setCopied(false)
    timerRef.current = setTimeout(close, 20000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onCompleteRef.current(), 400)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commentText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (!username) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <div
        className="relative text-center px-10 py-10 rounded-2xl border-2 max-w-lg w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderColor: '#ec4899',
          boxShadow: '0 0 40px #ec489960, 0 0 80px #a855f730',
        }}
      >
        <div className="text-5xl mb-4">📌</div>

        <h2 className="text-3xl font-black mb-1" style={{ color: '#ec4899', textShadow: '0 0 20px #ec4899' }}>
          ¡Fijar comentario!
        </h2>
        <p className="text-muted-foreground mb-6">Copiá el texto y pegalo en TikTok</p>

        {/* Comment text box */}
        <div
          className="p-4 rounded-xl mb-6 text-left text-white font-medium text-lg leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {commentText}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCopy}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ec4899, #a855f7)',
              boxShadow: copied ? '0 0 20px #10b98180' : '0 0 20px #ec489980',
              color: 'white',
            }}
          >
            {copied ? '✅ ¡Copiado!' : '📋 Copiar texto'}
          </button>
          <button
            onClick={close}
            className="px-8 py-3 rounded-xl font-bold text-lg border border-white/20 text-white/70 hover:text-white transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            Cerrar
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">Se cierra automáticamente en 20s</p>
      </div>
    </div>
  )
}
