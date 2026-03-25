'use client'

import { Crown } from 'lucide-react'

interface TopFanProps {
  usernames: string[]
}

export function TopFan({ usernames }: TopFanProps) {
  return (
    <div
      className="p-2 rounded-xl bg-card/50 border backdrop-blur-sm text-center"
      style={{
        borderColor: usernames.length > 0 ? '#fbbf24' : 'var(--border)',
        boxShadow: usernames.length > 0 ? '0 0 15px #fbbf2460' : 'none',
      }}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        <Crown className="w-4 h-4 text-amber-400" />
        <h3 className="font-bold text-amber-400 text-glow-gold text-sm">Top Fan</h3>
        <Crown className="w-4 h-4 text-amber-400" />
      </div>

      {usernames.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nadie aún...</p>
      ) : (
        <div className="flex flex-col gap-1">
          {usernames.map((u, i) => (
            <div
              key={u}
              className="text-sm font-black truncate"
              style={{
                background: i === 0
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {i === 0 ? '🔝' : '⭐'} @{u}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
