// Global state for the roulette game
export interface Prize {
  id: string
  label: string
  emoji: string
  color: string
  weight: number // Probability weight (higher = more likely)
}

export interface GiftEvent {
  id: string
  username: string
  giftType: 'rose' | 'big'
  giftName?: string
  giftEmoji?: string
  timestamp: number
}

export interface SpinResult {
  username: string
  prize: Prize
  timestamp: number
}

export interface LeaderboardEntry {
  username: string
  giftCount: number
}

export const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: 'Segu\u00ed intentando', emoji: '\u274c', color: '#6b7280', weight: 80 },
  { id: '2', label: 'Mencionar cuenta', emoji: '\ud83d\udce3', color: '#a855f7', weight: 50 },
  { id: '3', label: 'Girar GRATIS', emoji: '\ud83d\udd01', color: '#f59e0b', weight: 30 },
  { id: '4', label: 'Fijar comentario', emoji: '\ud83d\udccc', color: '#ec4899', weight: 20 },
  { id: '5', label: 'Top fan', emoji: '\ud83d\udd1d', color: '#3b82f6', weight: 10 },
  { id: '6', label: 'Doble turno', emoji: '\ud83c\udfaf', color: '#10b981', weight: 15 },
  { id: '7', label: 'No pod\u00e9s perder', emoji: '\ud83c\udfc6', color: '#f97316', weight: 90 },
  { id: '8', label: 'Avanza en ranking', emoji: '\ud83d\ude80', color: '#06b6d4', weight: 40 },
  { id: '9', label: 'Pon\u00e9s una canci\u00f3n', emoji: '\ud83c\udfa7', color: '#8b5cf6', weight: 5 },
  { id: '10', label: 'Shoutout', emoji: '\ud83d\udcf8', color: '#f43f5e', weight: 8 },
]

// Weighted random selection
export function selectPrize(prizes: Prize[]): Prize {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
  let random = Math.random() * totalWeight
  for (const prize of prizes) {
    random -= prize.weight
    if (random <= 0) return prize
  }
  return prizes[0]
}

// Calculate the rotation angle to land on a specific prize.
export function calculateSpinAngle(prizeIndex: number, totalPrizes: number, startAngle: number = 0): number {
  const segmentAngle = 360 / totalPrizes
  const targetRotation = (((prizeIndex + 0.5) * segmentAngle) % 360 + 360) % 360

  const startNormalized = ((startAngle % 360) + 360) % 360
  let delta = targetRotation - startNormalized
  if (delta < 0) delta += 360
  if (delta < 10) delta += 360

  return 8 * 360 + delta
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
