import { NextResponse } from 'next/server'

// Stores pending pin comment notifications
let pendingPinComment: { username: string; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    pendingPinComment = { username, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ pending: pendingPinComment })
}

export async function DELETE() {
  pendingPinComment = null
  return NextResponse.json({ success: true })
}
