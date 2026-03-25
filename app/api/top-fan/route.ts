import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET() {
  const db = readDb()
  return NextResponse.json({ topFan: db.topFan })
}

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    const topFan = Array.isArray(username) ? username : (username ? [username] : [])
    writeDb({ topFan })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
