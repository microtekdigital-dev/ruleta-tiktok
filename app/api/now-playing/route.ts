import { NextResponse } from 'next/server'

let nowPlaying: { title: string; timestamp: number } | null = null

export async function POST(request: Request) {
  try {
    const { title } = await request.json()
    nowPlaying = title ? { title, timestamp: Date.now() } : null
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ nowPlaying })
}
