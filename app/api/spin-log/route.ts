import { NextResponse } from 'next/server'

export interface SpinLogEntry {
  id: string
  username: string
  prize: string
  emoji: string
  timestamp: number
}

const spinLog: SpinLogEntry[] = []

export async function POST(request: Request) {
  try {
    const { username, prize, emoji } = await request.json()
    if (!username || !prize) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const entry: SpinLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      username,
      prize,
      emoji: emoji ?? '🎰',
      timestamp: Date.now(),
    }
    spinLog.unshift(entry) // newest first
    if (spinLog.length > 200) spinLog.pop() // cap at 200
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ logs: spinLog })
}

export async function DELETE() {
  spinLog.length = 0
  return NextResponse.json({ success: true })
}
