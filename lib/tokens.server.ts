import { createHmac, timingSafeEqual } from 'crypto'

// Falls back to a dev secret if env var not set.
// In production, set ANSWER_SECRET in Netlify environment variables.
const SECRET = process.env.ANSWER_SECRET ?? 'hx-escape-room-dev-secret-change-in-prod'

export interface RoomToken {
  roomId: string
  completedAt: number
  sig: string
}

export function signToken(roomId: string, completedAt: number): RoomToken {
  const data = `${roomId}:${completedAt}`
  const sig = createHmac('sha256', SECRET).update(data).digest('hex')
  return { roomId, completedAt, sig }
}

export function verifyToken(token: RoomToken): boolean {
  if (!token?.roomId || !token?.completedAt || !token?.sig) return false

  const data = `${token.roomId}:${token.completedAt}`
  const expected = createHmac('sha256', SECRET).update(data).digest('hex')

  // Constant-time comparison prevents timing-based forgery attacks
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(token.sig, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
