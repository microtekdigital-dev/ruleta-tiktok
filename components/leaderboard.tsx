'use client'

import { Trophy, Medal, Award } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/game-store'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.giftCount - a.giftCount).slice(0, 5)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-400" style={{ filter: 'drop-shadow(0 0 5px #fbbf24)' }} />
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" style={{ filter: 'drop-shadow(0 0 5px #d1d5db)' }} />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" style={{ filter: 'drop-shadow(0 0 5px #d97706)' }} />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank + 1}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-400/50'
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/50'
      case 2:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-600/50'
      default:
        return 'bg-card/50 border-border/50'
    }
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-glow-gold">
          <Trophy className="w-5 h-5 text-amber-400" />
          Top Regalos
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          {'\u00a1A\u00fan no hay regalos!'}
        </p>
      </div>
    )
  }

  return (
    <div 
      className="p-4 rounded-xl bg-card/50 border border-primary/30 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 15px var(--neon-purple), inset 0 0 20px rgba(168, 85, 247, 0.1)'
      }}
    >
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-glow-gold">
        <Trophy className="w-5 h-5 text-amber-400 animate-gold-pulse" />
        Top Regalos
      </h3>
      <div className="flex flex-col gap-2">
        {sortedEntries.map((entry, index) => (
          <div
            key={entry.username}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg border
              transition-all duration-300 hover:scale-[1.02]
              ${getRankStyle(index)}
            `}
          >
            {getRankIcon(index)}
            <span className="flex-1 font-medium truncate">{entry.username}</span>
            <span className="text-sm font-bold text-primary">
              {entry.giftCount} {'\ud83c\udf39'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
