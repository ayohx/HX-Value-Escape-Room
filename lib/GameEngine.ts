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
   * Submit room result and validate
   */
  submitRoomResult(
    roomId: string,
    payload: any,
    timeTaken: number
  ): { success: boolean; message: string; learning?: string; nextEvent?: any } {
    const room = this.getRoomById(roomId)
    if (!room) {
      throw new Error(`Room ${roomId} not found`)
    }

    const progress = getPlayerProgress()
    if (!progress) {
      throw new Error('No player progress found')
    }

    // Validate based on room type
    const validation = this.validateRoomAnswer(room, payload)

    if (validation.success) {
      // Calculate score (base 100, minus time penalties and hint usage)
      const hintsUsed = progress.rooms[roomId]?.hintsUsed || 0
      const score = Math.max(50, 100 - hintsUsed * 10 - Math.floor(timeTaken / 10))

      // Mark room as completed
      completeRoom(roomId, this.getRoomIds(), timeTaken, score, payload.choices)

      // Emit room completed event
      this.emitEvent({
        type: 'roomCompleted',
        roomId,
        timestamp: Date.now(),
        data: { score, timeTaken },
      })

      // Check if all rooms completed
      const allCompleted = this.checkAllRoomsCompleted()
      if (allCompleted) {
        this.emitEvent({
          type: 'allRoomsCompleted',
          timestamp: Date.now(),
          data: { progress: getPlayerProgress() },
        })
      }

      return {
        success: true,
        message: room.onSuccess.message,
        learning: room.onSuccess.learning,
        nextEvent: validation.nextEvent,
      }
    } else {
      // Increment attempts
      incrementRoomAttempts(roomId)

      // Emit room failed event
      this.emitEvent({
        type: 'roomFailed',
        roomId,
        timestamp: Date.now(),
        data: { attempts: progress.rooms[roomId]?.attempts || 0 },
      })

      return {
        success: false,
        message: validation.message || 'Not quite right. Try again!',
      }
    }
  }

  /**
   * Validate room answer based on room type
   */
  private validateRoomAnswer(
    room: RoomConfig,
    payload: any
  ): { success: boolean; message?: string; nextEvent?: any } {
    switch (room.type) {
      case 'reorder': {
        const correctOrder = room.task.correctOrder
        const userOrder = payload.order || []
        const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder)
        return {
          success: isCorrect,
          message: isCorrect ? undefined : 'The command chain order is not correct.',
        }
      }

      case 'timed-choice': {
        const selectedChoice = payload.choiceId
        const choice = room.task.choices.find((c: any) => c.id === selectedChoice)
        
        if (!choice) {
          return { success: false, message: 'Invalid choice' }
        }

        if (choice.outcome === 'success') {
          // Check for branching/additional events
          const nextEvent = room.branching?.successPath?.nextEvent
          return {
            success: true,
            nextEvent: nextEvent ? room.additionalEvent : undefined,
          }
        }

        return {
          success: choice.outcome === 'partial',
          message: choice.outcome === 'fail' ? 'That approach failed. Try another strategy.' : 'Partial success, but not optimal.',
        }
      }

      case 'multi-step': {
        // Validate first step (choice)
        const step1Choice = payload.step1Choice
        const step1Choices = room.task.steps[0].choices
        const selectedStep1 = step1Choices.find((c: any) => c.id === step1Choice)

        if (!selectedStep1 || selectedStep1.result !== 'success') {
          return {
            success: false,
            message: 'Your response to the colleague was not the best choice.',
          }
        }

        // Validate second step (puzzle completion)
        const puzzleCompleted = payload.puzzleCompleted
        if (!puzzleCompleted) {
          return {
            success: false,
            message: 'The connection grid puzzle was not completed correctly.',
          }
        }

        return { success: true }
      }

      case 'matching-choice': {
        // Check if pairs are matched (in this simple version, we assume they match correctly)
        const powerUpChoice = payload.powerUpChoice
        const correctPowerUp = room.task.correctPowerUp

        return {
          success: powerUpChoice === correctPowerUp,
          message: powerUpChoice !== correctPowerUp ? 'That power-up is not the optimal choice for growth.' : undefined,
        }
      }

      case 'choice-final': {
        // First check the main choice (any is acceptable)
        const mainChoice = payload.mainChoice
        if (!mainChoice) {
          return { success: false, message: 'Please select a concept to develop.' }
        }

        // Then check the final puzzle
        const finalChoice = payload.finalChoice
        const correctAnswer = room.finalPuzzle?.correct

        return {
          success: finalChoice === correctAnswer,
          message: finalChoice !== correctAnswer ? 'That\'s not quite the key to discovery. Think about what drives innovation.' : undefined,
        }
      }

      default:
        return { success: false, message: 'Unknown room type' }
    }
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


