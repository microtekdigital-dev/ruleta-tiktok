'use client'

import { Trophy } from 'lucide-react'

export interface RankingEntry {
  username: string
  points: number
}

interface RankingBoardProps {
  entries: RankingEntry[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export function RankingBoard({ entries }: RankingBoardProps) {
  const sorted = [...entries].sort((a, b) => b.points - a.points).slice(0, 3)

  return (
    <div
      className="p-2 rounded-xl bg-card/50 border backdrop-blur-sm"
      style={{ borderColor: '#06b6d4', boxShadow: '0 0 15px #06b6d430' }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-cyan-400" />
        <h3 className="font-bold text-cyan-400 text-sm">Ranking</h3>
        <Trophy className="w-4 h-4 text-cyan-400" />
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center">Nadie aún...</p>
      ) : (
        <div className="flex gap-1 flex-wrap justify-center">
          {sorted.map((entry, i) => (
            <div
              key={entry.username}
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, #fbbf2420, #f59e0b10)' : 'rgba(255,255,255,0.04)',
                border: i === 0 ? '1px solid #fbbf2440' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-sm">{MEDALS[i] ?? `${i + 1}.`}</span>
              <span className="text-xs font-semibold text-white truncate max-w-[70px]">@{entry.username}</span>
              <span className="text-xs font-black" style={{ color: '#06b6d4' }}>{entry.points}🚀</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
