import { NextResponse } from 'next/server'

// Stores a pending free spin to be picked up by the main page
let pendingTrigger: { username: string; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    pendingTrigger = { username, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ pending: pendingTrigger })
}

export async function DELETE() {
  pendingTrigger = null
  return NextResponse.json({ success: true })
}
