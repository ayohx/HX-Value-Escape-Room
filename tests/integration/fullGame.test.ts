import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '@/lib/GameEngine'
import { resetProgress, getPlayerProgress } from '@/lib/Storage'

describe('Full Game Playthrough Integration Test', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = new GameEngine()
    resetProgress()
  })

  it('should complete full game playthrough successfully', () => {
    // Start game
    const startProgress = engine.startGame()
    expect(startProgress.currentRoomId).toBe('room1_helm')

    // Room 1: Reorder Puzzle
    const room1Result = engine.submitRoomResult(
      'room1_helm',
      { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
      12
    )
    expect(room1Result.success).toBe(true)
    expect(room1Result.learning).toContain('Leaders act with clarity')

    let progress = getPlayerProgress()
    expect(progress?.rooms['room1_helm'].status).toBe('completed')
    expect(progress?.currentRoomId).toBe('room2_firewall')

    // Room 2: Timed Choice
    const room2Result = engine.submitRoomResult(
      'room2_firewall',
      { choiceId: 'risky_pilot' },
      25
    )
    expect(room2Result.success).toBe(true)
    expect(room2Result.nextEvent).toBeDefined() // Red button event

    progress = getPlayerProgress()
    expect(progress?.rooms['room2_firewall'].status).toBe('completed')
    expect(progress?.currentRoomId).toBe('room3_one_team')

    // Room 3: Multi-step Puzzle
    const room3Result = engine.submitRoomResult(
      'room3_one_team',
      { step1Choice: 'support', puzzleCompleted: true },
      38
    )
    expect(room3Result.success).toBe(true)
    expect(room3Result.learning).toContain('Collaboration creates clarity')

    progress = getPlayerProgress()
    expect(progress?.rooms['room3_one_team'].status).toBe('completed')
    expect(progress?.currentRoomId).toBe('room4_upgrade')

    // Room 4: Matching Choice
    const room4Result = engine.submitRoomResult(
      'room4_upgrade',
      { powerUpChoice: 'curiosity' },
      15
    )
    expect(room4Result.success).toBe(true)
    expect(room4Result.learning).toContain('Curiosity fuels growth')

    progress = getPlayerProgress()
    expect(progress?.rooms['room4_upgrade'].status).toBe('completed')
    expect(progress?.currentRoomId).toBe('room5_innovation')

    // Room 5: Final Puzzle
    const room5Result = engine.submitRoomResult(
      'room5_innovation',
      { mainChoice: 'map_trip', finalChoice: 'failure' },
      20
    )
    expect(room5Result.success).toBe(true)
    expect(room5Result.learning).toContain('misstep sparks innovation')

    progress = getPlayerProgress()
    expect(progress?.rooms['room5_innovation'].status).toBe('completed')
    expect(progress?.completedAt).toBeDefined()

    // Verify all rooms completed
    const allCompleted = engine.checkAllRoomsCompleted()
    expect(allCompleted).toBe(true)

    // Verify final score
    expect(progress?.totalScore).toBeGreaterThan(400) // Should have good score for completing quickly

    // Verify all rooms have correct statuses
    const roomIds = engine.getRoomIds()
    roomIds.forEach((roomId) => {
      expect(progress?.rooms[roomId].status).toBe('completed')
      expect(progress?.rooms[roomId].timeTakenSec).toBeGreaterThan(0)
    })
  })

  it('should handle failures and retries', () => {
    engine.startGame()

    // Fail Room 1 first
    const failResult = engine.submitRoomResult(
      'room1_helm',
      { order: ['Act', 'Plan', 'Decide', 'Communicate'] },
      10
    )
    expect(failResult.success).toBe(false)

    let progress = getPlayerProgress()
    expect(progress?.rooms['room1_helm'].attempts).toBe(1)
    expect(progress?.rooms['room1_helm'].status).toBe('in_progress')

    // Retry and succeed
    const successResult = engine.submitRoomResult(
      'room1_helm',
      { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
      15
    )
    expect(successResult.success).toBe(true)

    progress = getPlayerProgress()
    expect(progress?.rooms['room1_helm'].status).toBe('completed')
    expect(progress?.rooms['room1_helm'].attempts).toBe(1)
  })

  it('should preserve progress across game reloads', () => {
    // Start game and complete first room
    engine.startGame()
    engine.submitRoomResult(
      'room1_helm',
      { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
      10
    )

    // Create new engine instance (simulating page reload)
    const newEngine = new GameEngine()
    const resumedProgress = newEngine.startGame()

    // Should resume from Room 2
    expect(resumedProgress.currentRoomId).toBe('room2_firewall')
    expect(resumedProgress.rooms['room1_helm'].status).toBe('completed')
    expect(resumedProgress.rooms['room2_firewall'].status).toBe('in_progress')
  })
})


