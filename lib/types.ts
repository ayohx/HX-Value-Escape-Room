// Game state types
export type GameState = 'idle' | 'briefing' | 'tutorial' | 'playing' | 'result_success' | 'result_fail' | 'completed'

export type RoomStatus = 'locked' | 'in_progress' | 'completed'

export interface RoomProgress {
  status: RoomStatus
  timeTakenSec?: number
  attempts: number
  choices?: string[]
  score?: number
  hintsUsed?: number
}

export interface PlayerProgress {
  playerId: string
  startedAt: string
  lastUpdated: string
  currentRoomId: string | null
  rooms: Record<string, RoomProgress>
  totalScore: number
  completedAt?: string
}

// Game config types
export interface GameConfig {
  title: string
  rooms: RoomConfig[]
}

export interface RoomConfig {
  id: string
  value: string
  roomTitle: string
  type: string
  task: any
  branching?: any
  additionalEvent?: any
  finalPuzzle?: any
  onSuccess: {
    message: string
    learning: string
  }
}

// Event types
export type GameEventType = 'roomStarted' | 'roomCompleted' | 'roomFailed' | 'allRoomsCompleted' | 'gameReset' | 'hintUsed'

export interface GameEvent {
  type: GameEventType
  roomId?: string
  timestamp: number
  data?: any
}

export type GameEventListener = (event: GameEvent) => void

