'use client'

import { useEffect, useState } from 'react'
import type { GiftEvent } from '@/lib/game-store'

interface GiftNotificationProps {
  gift: GiftEvent
  onComplete: () => void
}

export function GiftNotification({ gift, onComplete }: GiftNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  const giftEmoji = gift.giftEmoji || (gift.giftType === 'rose' ? '🌹' : '💎')
  const giftName = gift.giftName || (gift.giftType === 'rose' ? 'Rosa' : 'Regalo Grande')

  return (
    <div
      className={`
        flex items-center gap-3 px-6 py-4 rounded-xl
        bg-gradient-to-r from-primary/20 via-card to-primary/20
        border border-primary/50 backdrop-blur-sm
        transition-all duration-500
        ${isVisible ? 'animate-slide-in opacity-100' : 'opacity-0 translate-x-20'}
      `}
      style={{
        boxShadow: '0 0 20px var(--neon-purple), 0 0 40px var(--neon-purple)'
      }}
    >
      <span className="text-4xl animate-bounce">{giftEmoji}</span>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground text-glow-purple">
          {gift.username}
        </span>
        <span className="text-sm text-muted-foreground">
          {`envi\u00f3 una ${giftName}!`}
        </span>
      </div>
    </div>
  )
}

interface GiftNotificationContainerProps {
  gifts: GiftEvent[]
  onGiftComplete: (id: string) => void
}

export function GiftNotificationContainer({ gifts, onGiftComplete }: GiftNotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-3 z-50 max-w-sm">
      {[...gifts].reverse().map((gift) => (
        <GiftNotification
          key={gift.id}
          gift={gift}
          onComplete={() => onGiftComplete(gift.id)}
        />
      ))}
    </div>
  )
}
