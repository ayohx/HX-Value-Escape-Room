import { NextRequest, NextResponse } from 'next/server'
import { ROOM_ANSWERS } from '@/lib/answers.server'
import { signToken } from '@/lib/tokens.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, payload } = body

    if (!roomId || !payload) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
    }

    const answers = ROOM_ANSWERS[roomId]
    if (!answers) {
      return NextResponse.json({ success: false, message: 'Unknown room' }, { status: 400 })
    }

    const result = validateAnswer(answers, payload)

    if (result.success) {
      const completedAt = Date.now()
      const token = signToken(roomId, completedAt)
      return NextResponse.json({ ...result, token })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}

function validateAnswer(
  answers: (typeof ROOM_ANSWERS)[string],
  payload: Record<string, unknown>
): { success: boolean; message?: string; nextEvent?: boolean } {
  switch (answers.type) {
    case 'reorder': {
      const isCorrect =
        JSON.stringify(answers.correctOrder) === JSON.stringify(payload.order ?? [])
      return {
        success: isCorrect,
        message: isCorrect ? undefined : 'The command chain order is not correct.',
      }
    }

    case 'timed-choice': {
      const choiceId = payload.choiceId as string
      if (choiceId === answers.successChoiceId) {
        return { success: true, nextEvent: true }
      }
      if (choiceId === answers.partialChoiceId) {
        return { success: true, nextEvent: false }
      }
      return { success: false, message: 'That approach failed. Try another strategy.' }
    }

    case 'multi-step': {
      if (payload.step1Choice === answers.step1FailId) {
        return { success: false, message: 'Your response to the colleague was not the best choice.' }
      }
      if (!payload.puzzleCompleted) {
        return { success: false, message: 'The connection grid puzzle was not completed correctly.' }
      }
      return { success: true }
    }

    case 'matching-choice': {
      const isCorrect = payload.powerUpChoice === answers.correctPowerUp
      return {
        success: isCorrect,
        message: isCorrect ? undefined : 'That power-up is not the optimal choice for growth.',
      }
    }

    case 'choice-final': {
      if (!payload.mainChoice) {
        return { success: false, message: 'Please select a concept to develop.' }
      }
      const isCorrect = payload.finalChoice === answers.correctFinalAnswer
      return {
        success: isCorrect,
        message: isCorrect
          ? undefined
          : "That's not quite the key to discovery. Think about what drives innovation.",
      }
    }

    default:
      return { success: false, message: 'Unknown room type' }
  }
}
