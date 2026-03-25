import { NextResponse } from 'next/server'

// In-memory gift queue (will reset on cold starts, but works for demo)
// In production, use Redis/database
const giftQueue: Array<{
  id: string
  username: string
  giftType: 'rose' | 'big'
  timestamp: number
}> = []

let lastId = 0

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, gift, value, giftName, giftEmoji, avatarUrl } = body

    if (!username || !gift) {
      return NextResponse.json(
        { error: 'Missing username or gift type' },
        { status: 400 }
      )
    }

    // Si viene con valor, clasificar automáticamente: 1 = rose, >1 = big
    let giftType: 'rose' | 'big'
    if (value !== undefined) {
      giftType = value <= 1 ? 'rose' : 'big'
    } else if (gift === 'rose') {
      giftType = 'rose'
    } else if (gift === 'big') {
      giftType = 'big'
    } else {
      return NextResponse.json(
        { error: 'Invalid gift type. Must be "rose" or "big"' },
        { status: 400 }
      )
    }

    // Create the gift event
    const giftEvent = {
      id: `gift-${++lastId}`,
      username,
      giftType,
      giftName: giftName || (giftType === 'rose' ? 'Rosa' : 'Regalo Grande'),
      giftEmoji: giftEmoji || (giftType === 'rose' ? '🌹' : '💎'),
      avatarUrl: avatarUrl || null,
      timestamp: Date.now(),
    }

    // Add to queue
    giftQueue.push(giftEvent)

    // Keep only last 100 gifts to prevent memory issues
    if (giftQueue.length > 100) {
      giftQueue.shift()
    }

    return NextResponse.json({
      success: true,
      message: `Gift from ${username} processed`,
      event: giftEvent,
      queueLength: giftQueue.length,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// Polling endpoint - returns all gifts since lastTimestamp
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const since = parseInt(searchParams.get('since') || '0', 10)

  // Get all gifts after the timestamp
  const newGifts = giftQueue.filter(g => g.timestamp > since)

  return NextResponse.json({
    gifts: newGifts,
    timestamp: Date.now(),
    queueTotal: giftQueue.length,
  })
}
