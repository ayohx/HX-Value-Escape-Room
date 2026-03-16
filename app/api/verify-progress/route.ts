import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, RoomToken } from '@/lib/tokens.server'

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json()

    if (!Array.isArray(tokens)) {
      return NextResponse.json({ valid: false, validRooms: [] })
    }

    const validRooms = (tokens as RoomToken[])
      .filter((token) => verifyToken(token))
      .map((token) => token.roomId)

    return NextResponse.json({ valid: validRooms.length > 0, validRooms })
  } catch {
    return NextResponse.json({ valid: false, validRooms: [] })
  }
}
