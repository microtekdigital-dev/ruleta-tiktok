import { NextResponse } from 'next/server'

let pendingSongRequest: { username: string; timestamp: number } | null = null
let currentSong: { username: string; title: string; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    pendingSongRequest = { username, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ pending: pendingSongRequest, currentSong })
}

export async function PUT(request: Request) {
  try {
    const { username, title } = await request.json()
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    currentSong = { username, title, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  pendingSongRequest = null
  return NextResponse.json({ success: true })
}
