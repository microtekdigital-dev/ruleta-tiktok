'use client'

import { Sparkles } from 'lucide-react'
import type { SpinResult } from '@/lib/game-store'

interface WinnerDisplayProps {
  lastResult: SpinResult | null
  isSpinning: boolean
}

export function WinnerDisplay({ lastResult, isSpinning }: WinnerDisplayProps) {
  if (isSpinning) {
    return (
      <div className="p-3 rounded-xl bg-card/50 border border-primary/30 backdrop-blur-sm text-center"
        style={{ boxShadow: '0 0 15px var(--neon-purple)' }}>
        <div className="flex items-center justify-center gap-1 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <h3 className="text-lg font-bold text-glow-purple animate-pulse">Girando...</h3>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
        <p className="text-muted-foreground text-xs">{'\u00a1Buena suerte!'}</p>
      </div>
    )
  }

  if (!lastResult) {
    return (
      <div className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm text-center">
        <h3 className="text-sm font-bold mb-1">{'\u00a1Esperando regalos!'}</h3>
        <p className="text-muted-foreground text-xs">{`Env\u00eda una Rosa \ud83c\udf39`}</p>
      </div>
    )
  }

  const isWin = lastResult.prize.label !== 'Segu\u00ed intentando'

  return (
    <div
      className={`p-3 rounded-xl backdrop-blur-sm text-center ${isWin
        ? 'bg-gradient-to-br from-amber-500/20 via-card to-primary/20 border-2 border-amber-400/50'
        : 'bg-card/50 border border-border/50'}`}
      style={isWin ? { boxShadow: '0 0 20px var(--neon-gold), 0 0 40px var(--neon-purple)' } : {}}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {isWin && <Sparkles className="w-4 h-4 text-amber-400 animate-gold-pulse" />}
        <h3 className={`text-sm font-bold ${isWin ? 'text-glow-gold' : ''}`}>
          {isWin ? '\u00a1Ganador!' : 'Resultado'}
        </h3>
        {isWin && <Sparkles className="w-4 h-4 text-amber-400 animate-gold-pulse" />}
      </div>
      <div className="mb-1">
        <span className="text-3xl" style={{ filter: isWin ? 'drop-shadow(0 0 8px #fbbf24)' : '' }}>
          {lastResult.prize.emoji}
        </span>
      </div>
      <p className={`text-sm font-bold mb-1 ${isWin ? 'text-glow-purple' : ''}`}>
        {lastResult.prize.label}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        <span className="font-bold text-foreground">@{lastResult.username}</span>
      </p>
    </div>
  )
}
