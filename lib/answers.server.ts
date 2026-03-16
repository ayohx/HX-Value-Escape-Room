// SERVER-ONLY — imported only by app/api/ routes, never by client components.
// Correct answers for all 5 current room puzzles.
// These values must NOT appear in gameConfig.json or the client bundle.

export const ROOM_ANSWERS: Record<string, RoomAnswers> = {
  room1_helm: {
    type: 'reorder',
    correctOrder: ['Plan', 'Decide', 'Communicate', 'Act'],
  },
  room2_firewall: {
    type: 'timed-choice',
    successChoiceId: 'risky_pilot',
    partialChoiceId: 'safe_delay',
    failChoiceId: 'shutdown',
  },
  room3_one_team: {
    type: 'multi-step',
    step1SuccessId: 'support',
    step1PartialId: 'fix_quiet',
    step1FailId: 'blame',
  },
  room4_upgrade: {
    type: 'matching-choice',
    correctPowerUp: 'curiosity',
  },
  room5_innovation: {
    type: 'choice-final',
    correctFinalAnswer: 'failure',
    // mainChoice accepts any value — all are valid starting points
  },
}

export type RoomAnswers =
  | { type: 'reorder'; correctOrder: string[] }
  | { type: 'timed-choice'; successChoiceId: string; partialChoiceId: string; failChoiceId: string }
  | { type: 'multi-step'; step1SuccessId: string; step1PartialId: string; step1FailId: string }
  | { type: 'matching-choice'; correctPowerUp: string }
  | { type: 'choice-final'; correctFinalAnswer: string }
