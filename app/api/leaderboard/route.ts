import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET() {
  const db = readDb()
  return NextResponse.json({ leaderboard: db.leaderboard })
}

export async function POST(request: Request) {
  try {
    const { leaderboard } = await request.json()
    writeDb({ leaderboard: leaderboard || [] })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
