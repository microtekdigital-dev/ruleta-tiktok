'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SocketProvider, useSocket } from '@/lib/socket-context'
import { RouletteWheel } from '@/components/roulette-wheel'
import { GiftNotificationContainer } from '@/components/gift-notification'
import { Leaderboard } from '@/components/leaderboard'
import { WinnerDisplay } from '@/components/winner-display'
import { Confetti } from '@/components/confetti'
import { MentionOverlay } from '@/components/mention-overlay'
import { TopFan } from '@/components/top-fan'
import { DoubleTurnOverlay } from '@/components/double-turn-overlay'
import { SongOverlay } from '@/components/song-overlay'
import { NoLoseOverlay } from '@/components/no-lose-overlay'
import { RankingBoard, type RankingEntry } from '@/components/ranking-board'
import { MusicPlayer } from '@/components/music-player'
import { BigGiftEffect } from '@/components/big-gift-effect'
import { ShoutoutOverlay } from '@/components/shoutout-overlay'
import { WordChallengeOverlay } from '@/components/word-challenge-overlay'
import { Sparkles } from 'lucide-react'

function GameContent() {
  const { gameState, clearGift, processNextSpin, updateRotation, addDoubleTurn, addFreeSpin, correctLastResult } = useSocket()
  const [mentionUsername, setMentionUsername] = useState<string | null>(null)
  const [topFan, setTopFan] = useState<string[]>([])
  const [doubleTurnUsername, setDoubleTurnUsername] = useState<string | null>(null)
  const [songUsername, setSongUsername] = useState<string | null>(null)
  const [noLoseUsername, setNoLoseUsername] = useState<string | null>(null)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [spinBonus, setSpinBonus] = useState<{ type: 'free' | 'double'; username: string } | null>(null)
  const [bigGiftUsername, setBigGiftUsername] = useState<string | null>(null)
  const [challengeWord, setChallengeWord] = useState<string | null>(null)
  const [challengeWinner, setChallengeWinner] = useState<string | null>(null)
  const prevGiftsRef = useRef<string[]>([])

  // Load persisted data after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const load = async () => {
      // Load ranking from DB
      try {
        const res = await fetch('/api/ranking')
        const data = await res.json()
        if (data.ranking?.length) setRanking(data.ranking)
      } catch {}
      // Load top fan from DB
      try {
        const res = await fetch('/api/top-fan')
        const data = await res.json()
        if (data.topFan?.length) setTopFan(Array.isArray(data.topFan) ? data.topFan : [data.topFan])
      } catch {}
    }
    load()
  }, [])

  // Poll for free spin triggers from admin (no gift notification)
  useEffect(() => {
    let isActive = true
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/free-spin-trigger')
        const data = await res.json()
        if (data.pending) {
          addFreeSpin(data.pending.username)
          await fetch('/api/free-spin-trigger', { method: 'DELETE' })
        }
      } catch {}
      if (isActive) setTimeout(poll, 1000)
    }
    poll()
    return () => { isActive = false }
  }, [addFreeSpin])

  // Poll word challenge winner
  useEffect(() => {
    let isActive = true
    let winnerHandled = false
    const poll = async () => {
      if (!isActive) return
      try {
        const res = await fetch('/api/word-challenge')
        const data = await res.json()
        if (data.challenge) {
          setChallengeWord(data.challenge.word)
          setChallengeWinner(null)
          winnerHandled = false
        } else if (data.winner && !winnerHandled) {
          winnerHandled = true
          setChallengeWord(null)
          setChallengeWinner(data.winner.username)
          addFreeSpin(data.winner.username)
          await fetch('/api/word-challenge', { method: 'DELETE' })
        } else if (!data.challenge && !data.winner) {
          setChallengeWord(null)
        }
      } catch {}
      if (isActive) setTimeout(poll, 1000)
    }
    poll()
    return () => { isActive = false }
  }, [addFreeSpin])

  // Detectar regalo grande para efecto especial
  useEffect(() => {
    const currentIds = gameState.activeGifts.map(g => g.id)
    const newBig = gameState.activeGifts.find(
      g => g.giftType === 'big' && !prevGiftsRef.current.includes(g.id)
    )
    if (newBig) setBigGiftUsername(newBig.username)
    prevGiftsRef.current = currentIds
  }, [gameState.activeGifts])
  useEffect(() => {
    if (gameState.isSpinning && gameState.lastResult) {
      const prize = gameState.lastResult.prize.label
      const username = gameState.lastResult.username
      if (prize === 'Girar GRATIS') {
        setSpinBonus({ type: 'free', username })
      } else if (prize === 'Doble turno') {
        setSpinBonus({ type: 'double', username })
      }
    } else if (!gameState.isSpinning) {
      // Limpiar después de un pequeño delay para que se vea el mensaje
      const t = setTimeout(() => setSpinBonus(null), 3000)
      return () => clearTimeout(t)
    }
  }, [gameState.isSpinning, gameState.lastResult])

  const [shoutoutUsername, setShoutoutUsername] = useState<string | null>(null)
  const prizesRef = useRef(gameState.prizes)
  useEffect(() => { prizesRef.current = gameState.prizes }, [gameState.prizes])

  const handleSpinComplete = useCallback((prize: string, emoji: string, username: string, visualIndex: number) => {
    const actualPrize = prizesRef.current[visualIndex]
    const actualLabel = actualPrize?.label ?? prize
    const actualEmoji = actualPrize?.emoji ?? emoji

    // Correct lastResult in state so WinnerDisplay shows the right prize
    if (actualPrize) correctLastResult(actualPrize)
    fetch('/api/spin-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, prize: actualLabel, emoji: actualEmoji }),
    })

    if (actualLabel === 'Mencionar cuenta') {
      setMentionUsername(username)
    } else if (actualLabel === 'Girar GRATIS') {
      addFreeSpin(username)
      processNextSpin()
    } else if (actualLabel === 'Doble turno') {
      addDoubleTurn(username)
      setDoubleTurnUsername(username)
    } else if (actualLabel === 'Fijar comentario') {
      fetch('/api/pin-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      processNextSpin()
    } else if (actualLabel === 'No podés perder') {
      setNoLoseUsername(username)
    } else if (actualLabel === 'Top fan') {
      setTopFan(prev => {
        const updated = [username, ...prev.filter(u => u !== username)].slice(0, 2)
        try {
          fetch('/api/top-fan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: updated }) })
        } catch {}
        return updated
      })
      processNextSpin()
    } else if (actualLabel === 'Avanza en ranking') {
      setRanking(prev => {
        const existing = prev.find(e => e.username === username)
        const updated = existing
          ? prev.map(e => e.username === username ? { ...e, points: e.points + 1 } : e)
          : [...prev, { username, points: 1 }]
        try {
          fetch('/api/ranking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ranking: updated }) })
        } catch {}
        return updated
      })
      processNextSpin()
    } else if (actualLabel === 'Ponés una canción') {
      setSongUsername(username)
      fetch('/api/song-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
    } else if (actualLabel === 'Shoutout') {
      setShoutoutUsername(username)
    } else {
      processNextSpin()
    }
  }, [processNextSpin, addFreeSpin, addDoubleTurn, correctLastResult])

  const handleDoubleTurnComplete = useCallback(() => {
    setDoubleTurnUsername(null)
    processNextSpin()
  }, [processNextSpin])

  const handleNoLoseComplete = useCallback(() => {
    setNoLoseUsername(null)
    processNextSpin()
  }, [processNextSpin])

  const handleSongComplete = useCallback(() => {
    setSongUsername(null)
    processNextSpin()
  }, [processNextSpin])

  const handleMentionComplete = useCallback(() => {
    setMentionUsername(null)
    processNextSpin()
  }, [processNextSpin])

  const handleShoutoutComplete = useCallback(() => {
    setShoutoutUsername(null)
    processNextSpin()
  }, [processNextSpin])

  return (
    <main className="min-h-screen bg-background overflow-hidden relative">
      {/* Big gift effect */}
      <BigGiftEffect
        username={bigGiftUsername}
        onComplete={() => setBigGiftUsername(null)}
      />

      {/* Word challenge overlay */}
      <WordChallengeOverlay
        word={challengeWord}
        winner={challengeWinner}
        onWinnerClaimed={() => setChallengeWinner(null)}
      />

      {/* Shoutout overlay */}
      <ShoutoutOverlay
        username={shoutoutUsername}
        avatarUrl={null}
        onComplete={handleShoutoutComplete}
      />

      {/* Confetti effect */}
      <Confetti isActive={gameState.showConfetti} />

      {/* No lose overlay */}
      <NoLoseOverlay
        username={noLoseUsername}
        onComplete={handleNoLoseComplete}
      />

      {/* Double turn overlay */}
      <DoubleTurnOverlay
        username={doubleTurnUsername}
        onComplete={handleDoubleTurnComplete}
      />

      {/* Song overlay */}
      <SongOverlay
        username={songUsername}
        onComplete={handleSongComplete}
      />

      {/* Mention overlay */}
      <MentionOverlay
        username={mentionUsername}
        onComplete={handleMentionComplete}
      />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: 'var(--neon-purple)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ backgroundColor: 'var(--neon-gold)', animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ backgroundColor: 'var(--neon-pink)', animationDelay: '0.5s' }}
        />
      </div>

      {/* Gift notifications */}
      <GiftNotificationContainer
        gifts={gameState.activeGifts}
        onGiftComplete={clearGift}
      />

      {/* Main content - layout vertical 9:16 para TikTok */}
      <div className="relative z-10 w-full max-w-[540px] mx-auto px-2 py-2 flex flex-col gap-2">
        {/* Header compacto */}
        <header className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-gold-pulse" />
            <h1
              className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-primary to-amber-400 bg-clip-text text-transparent"
              style={{ textShadow: '0 0 20px var(--neon-gold), 0 0 40px var(--neon-purple)' }}
            >
              Ruleta de Regalos
            </h1>
            <Sparkles className="w-5 h-5 text-amber-400 animate-gold-pulse" />
          </div>
          <p className="text-muted-foreground text-xs">
            {`Env\u00eda una Rosa \ud83c\udf39 para girar`}
          </p>
        </header>

        {/* Ruleta centrada */}
        <div className="flex flex-col items-center gap-2">
          <RouletteWheel
            prizes={gameState.prizes}
            isSpinning={gameState.isSpinning}
            targetAngle={gameState.targetAngle}
            currentResult={gameState.pendingResult}
            onSpinComplete={handleSpinComplete}
            onRotationUpdate={updateRotation}
          />

          {/* Cola */}
          {gameState.spinQueue.length > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/50 border border-primary/30 text-xs"
              style={{ boxShadow: '0 0 10px var(--neon-purple)' }}
            >
              <span className="text-muted-foreground">En cola:</span>
              <span className="font-bold text-primary text-glow-purple">{gameState.spinQueue.length}</span>
              <span className="text-muted-foreground">giros</span>
            </div>
          )}
        </div>

        {/* Winner + Top Fan en fila */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <WinnerDisplay lastResult={gameState.lastResult} isSpinning={gameState.isSpinning} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <TopFan usernames={topFan} />
            <RankingBoard entries={ranking} />
          </div>
        </div>

        {/* Leaderboard + Music en fila */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <Leaderboard entries={gameState.leaderboard} />
          </div>
          <div className="flex-1 min-w-0">
            <MusicPlayer spinBonus={spinBonus} />
          </div>
        </div>

        {/* Estado conexión */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-1">
          <div
            className={`w-2 h-2 rounded-full ${gameState.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ boxShadow: `0 0 8px ${gameState.isConnected ? '#22c55e' : '#f59e0b'}` }}
          />
          <span>{gameState.isConnected ? 'Conectado' : 'Conectando...'}</span>
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <SocketProvider>
      <GameContent />
    </SocketProvider>
  )
}
