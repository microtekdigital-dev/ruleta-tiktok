/**
 * Simple file-based database using JSON
 * Persists data across server restarts
 */
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

interface DbData {
  leaderboard: { username: string; giftCount: number }[]
  topFan: string[]
  ranking: { username: string; points: number }[]
}

const DEFAULT: DbData = {
  leaderboard: [],
  topFan: [],
  ranking: [],
}

function ensureDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readDb(): DbData {
  try {
    ensureDir()
    if (!fs.existsSync(DB_PATH)) return { ...DEFAULT }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function writeDb(data: Partial<DbData>) {
  try {
    ensureDir()
    const current = readDb()
    fs.writeFileSync(DB_PATH, JSON.stringify({ ...current, ...data }, null, 2))
  } catch (e) {
    console.error('DB write error:', e)
  }
}
