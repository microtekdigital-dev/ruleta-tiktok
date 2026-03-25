import { NextResponse } from 'next/server'

let pendingFreeSpin: { username: string; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    pendingFreeSpin = { username, timestamp: Date.now() }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ pending: pendingFreeSpin })
}

export async function DELETE() {
  pendingFreeSpin = null
  return NextResponse.json({ success: true })
}
