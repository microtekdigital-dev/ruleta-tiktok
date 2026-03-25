import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET() {
  const db = readDb()
  return NextResponse.json({ ranking: db.ranking })
}

export async function POST(request: Request) {
  try {
    const { ranking } = await request.json()
    writeDb({ ranking: ranking || [] })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
