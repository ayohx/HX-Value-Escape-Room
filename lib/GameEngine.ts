import { GameConfig, RoomConfig, GameEvent, PlayerProgress } from './types'
import {
  getPlayerProgress,
  initializePlayerProgress,
  completeRoom,
  incrementRoomAttempts,
  useHint as storageUseHint,
  resetProgress,
} from './Storage'
import gameConfigData from '@/data/gameConfig.json'

/**
 * GameEngine - Core game logic and state machine
 */
export class GameEngine {
  private config: GameConfig
  private eventListeners: ((event: GameEvent) => void)[] = []

  constructor() {
    this.config = gameConfigData as GameConfig
  }

  /**
   * Get game configuration
   */
  getConfig(): GameConfig {
    return this.config
  }

  /**
   * Get all room configs
   */
  getRooms(): RoomConfig[] {
    return this.config.rooms
  }

  /**
   * Get room IDs in order
   */
  getRoomIds(): string[] {
    return this.config.rooms.map((room) => room.id)
  }

  /**
   * Get specific room config by ID
   */
  getRoomById(roomId: string): RoomConfig | undefined {
    return this.config.rooms.find((room) => room.id === roomId)
  }

  /**
   * Get next room ID after current room
   */
  getNextRoomId(currentRoomId: string): string | null {
    const roomIds = this.getRoomIds()
    const currentIndex = roomIds.indexOf(currentRoomId)
    
    if (currentIndex >= 0 && currentIndex < roomIds.length - 1) {
      return roomIds[currentIndex + 1]
    }
    
    return null
  }

  /**
   * Start or resume game
   */
  startGame(): PlayerProgress {
    let progress = getPlayerProgress()

    if (!progress) {
      // Initialize new game
      progress = initializePlayerProgress(this.getRoomIds())
      this.emitEvent({
        type: 'gameReset',
        timestamp: Date.now(),
      })
    }

    return progress
  }

  /**
   * Start a specific room
   */
  startRoom(roomId: string): { room: RoomConfig; progress: PlayerProgress } {
    const room = this.getRoomById(roomId)
    if (!room) {
      throw new Error(`Room ${roomId} not found`)
    }

    const progress = getPlayerProgress()
    if (!progress) {
      throw new Error('No player progress found. Call startGame() first.')
    }

    // Emit room started event
    this.emitEvent({
      type: 'roomStarted',
      roomId,
      timestamp: Date.now(),
      data: { room },
    })

    return { room, progress }
  }

  /**
   * Record a server-validated room completion.
   * Answer validation happens server-side via /api/check-answer — never here.
   */
  recordRoomCompletion(roomId: string, timeTaken: number): void {
    const progress = getPlayerProgress()
    if (!progress) return

    const hintsUsed = progress.rooms[roomId]?.hintsUsed || 0
    const score = Math.max(50, 100 - hintsUsed * 10 - Math.floor(timeTaken / 10))

    completeRoom(roomId, this.getRoomIds(), timeTaken, score)

    this.emitEvent({
      type: 'roomCompleted',
      roomId,
      timestamp: Date.now(),
      data: { score, timeTaken },
    })

    if (this.checkAllRoomsCompleted()) {
      this.emitEvent({
        type: 'allRoomsCompleted',
        timestamp: Date.now(),
        data: { progress: getPlayerProgress() },
      })
    }
  }

  /**
   * Record a failed attempt (server returned failure).
   */
  recordRoomFailure(roomId: string): void {
    const progress = getPlayerProgress()
    incrementRoomAttempts(roomId)

    this.emitEvent({
      type: 'roomFailed',
      roomId,
      timestamp: Date.now(),
      data: { attempts: (progress?.rooms[roomId]?.attempts || 0) + 1 },
    })
  }

  /**
   * Use a hint for current room
   */
  useHint(roomId: string): void {
    storageUseHint(roomId)
    
    this.emitEvent({
      type: 'hintUsed',
      roomId,
      timestamp: Date.now(),
    })
  }

  /**
   * Check if all rooms are completed
   */
  checkAllRoomsCompleted(): boolean {
    const progress = getPlayerProgress()
    if (!progress) return false

    const roomIds = this.getRoomIds()
    return roomIds.every((roomId) => progress.rooms[roomId]?.status === 'completed')
  }

  /**
   * Get game state from progress
   */
  getGameState(): PlayerProgress | null {
    return getPlayerProgress()
  }

  /**
   * Reset entire game
   */
  resetGame(): void {
    resetProgress()
    this.emitEvent({
      type: 'gameReset',
      timestamp: Date.now(),
    })
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: GameEvent) => void): void {
    this.eventListeners.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: GameEvent) => void): void {
    this.eventListeners = this.eventListeners.filter((l) => l !== listener)
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: GameEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }
}

// Export singleton instance
export const gameEngine = new GameEngine()


