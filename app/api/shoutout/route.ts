import { NextResponse } from 'next/server'

let pendingShoutout: { username: string; avatarUrl: string | null; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { username, avatarUrl } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    pendingShoutout = { username, avatarUrl: avatarUrl || null, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ pending: pendingShoutout })
}

export async function DELETE() {
  pendingShoutout = null
  return NextResponse.json({ success: true })
}
