import { NextResponse } from 'next/server'

// Active challenge state
let activeChallenge: { word: string; startedAt: number } | null = null
let winner: { username: string; timestamp: number } | null = null

export async function GET() {
  return NextResponse.json({ challenge: activeChallenge, winner })
}

// Start a new challenge (from admin)
export async function POST(request: Request) {
  try {
    const { word } = await request.json()
    if (!word) return NextResponse.json({ error: 'Missing word' }, { status: 400 })
    activeChallenge = { word: word.toLowerCase().trim(), startedAt: Date.now() }
    winner = null
    return NextResponse.json({ success: true, challenge: activeChallenge })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Submit a winner (from tiktok-connect)
export async function PUT(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    if (!activeChallenge) return NextResponse.json({ error: 'No active challenge' }, { status: 400 })
    if (winner) return NextResponse.json({ error: 'Already won' }, { status: 409 })
    winner = { username, timestamp: Date.now() }
    activeChallenge = null
    return NextResponse.json({ success: true, winner })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Cancel challenge (from admin)
export async function DELETE() {
  activeChallenge = null
  winner = null
  return NextResponse.json({ success: true })
}
