import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '@/lib/GameEngine'
import { resetProgress } from '@/lib/Storage'

describe('GameEngine', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = new GameEngine()
    resetProgress()
  })

  describe('Configuration', () => {
    it('should load game configuration', () => {
      const config = engine.getConfig()
      expect(config).toBeDefined()
      expect(config.title).toBe('Holiday Extras Arcade Escape Room')
    })

    it('should have 5 rooms', () => {
      const rooms = engine.getRooms()
      expect(rooms).toHaveLength(5)
    })

    it('should return correct room IDs', () => {
      const roomIds = engine.getRoomIds()
      expect(roomIds).toEqual([
        'room1_helm',
        'room2_firewall',
        'room3_one_team',
        'room4_upgrade',
        'room5_innovation',
      ])
    })

    it('should get room by ID', () => {
      const room = engine.getRoomById('room1_helm')
      expect(room).toBeDefined()
      expect(room?.roomTitle).toBe('The Command Deck')
      expect(room?.value).toBe('Be At The Helm')
    })

    it('should return next room ID', () => {
      const nextRoom = engine.getNextRoomId('room1_helm')
      expect(nextRoom).toBe('room2_firewall')
    })

    it('should return null for last room', () => {
      const nextRoom = engine.getNextRoomId('room5_innovation')
      expect(nextRoom).toBeNull()
    })
  })

  describe('Game Flow', () => {
    it('should start a new game', () => {
      const progress = engine.startGame()
      expect(progress).toBeDefined()
      expect(progress.playerId).toMatch(/^anon-/)
      expect(progress.currentRoomId).toBe('room1_helm')
      expect(progress.rooms['room1_helm'].status).toBe('in_progress')
    })

    it('should start a specific room', () => {
      engine.startGame()
      const result = engine.startRoom('room1_helm')
      expect(result.room).toBeDefined()
      expect(result.progress).toBeDefined()
    })
  })

  describe('Room 1: Reorder Puzzle', () => {
    beforeEach(() => {
      engine.startGame()
    })

    it('should validate correct order', () => {
      const result = engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      expect(result.success).toBe(true)
      expect(result.message).toBe('Command chain restored. Navigation stabilised.')
    })

    it('should reject incorrect order', () => {
      const result = engine.submitRoomResult(
        'room1_helm',
        { order: ['Act', 'Plan', 'Communicate', 'Decide'] },
        10
      )
      expect(result.success).toBe(false)
    })
  })

  describe('Room 2: Timed Choice', () => {
    beforeEach(() => {
      engine.startGame()
      // Complete Room 1 first
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
    })

    it('should accept successful choice', () => {
      const result = engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      expect(result.success).toBe(true)
      expect(result.nextEvent).toBeDefined() // Should trigger red button
    })

    it('should reject failed choice', () => {
      const result = engine.submitRoomResult('room2_firewall', { choiceId: 'shutdown' }, 15)
      expect(result.success).toBe(false)
    })
  })

  describe('Room 4: Matching Choice', () => {
    it('should accept correct power-up', () => {
      engine.startGame()
      // Fast-forward to Room 4 by completing previous rooms
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      engine.submitRoomResult(
        'room3_one_team',
        { step1Choice: 'support', puzzleCompleted: true },
        20
      )

      const result = engine.submitRoomResult(
        'room4_upgrade',
        { powerUpChoice: 'curiosity' },
        12
      )
      expect(result.success).toBe(true)
    })

    it('should reject incorrect power-up', () => {
      engine.startGame()
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      engine.submitRoomResult(
        'room3_one_team',
        { step1Choice: 'support', puzzleCompleted: true },
        20
      )

      const result = engine.submitRoomResult('room4_upgrade', { powerUpChoice: 'focus' }, 12)
      expect(result.success).toBe(false)
    })
  })

  describe('Room 5: Final Puzzle', () => {
    it('should accept correct final answer', () => {
      engine.startGame()
      // Complete all previous rooms
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      engine.submitRoomResult(
        'room3_one_team',
        { step1Choice: 'support', puzzleCompleted: true },
        20
      )
      engine.submitRoomResult('room4_upgrade', { powerUpChoice: 'curiosity' }, 12)

      const result = engine.submitRoomResult(
        'room5_innovation',
        { mainChoice: 'map_trip', finalChoice: 'failure' },
        18
      )
      expect(result.success).toBe(true)
    })
  })

  describe('Game Completion', () => {
    it('should detect all rooms completed', () => {
      engine.startGame()

      // Complete all rooms
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      engine.submitRoomResult(
        'room3_one_team',
        { step1Choice: 'support', puzzleCompleted: true },
        20
      )
      engine.submitRoomResult('room4_upgrade', { powerUpChoice: 'curiosity' }, 12)
      engine.submitRoomResult(
        'room5_innovation',
        { mainChoice: 'map_trip', finalChoice: 'failure' },
        18
      )

      const allCompleted = engine.checkAllRoomsCompleted()
      expect(allCompleted).toBe(true)
    })

    it('should calculate total score', () => {
      engine.startGame()

      // Complete all rooms
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )
      engine.submitRoomResult('room2_firewall', { choiceId: 'risky_pilot' }, 15)
      engine.submitRoomResult(
        'room3_one_team',
        { step1Choice: 'support', puzzleCompleted: true },
        20
      )
      engine.submitRoomResult('room4_upgrade', { powerUpChoice: 'curiosity' }, 12)
      engine.submitRoomResult(
        'room5_innovation',
        { mainChoice: 'map_trip', finalChoice: 'failure' },
        18
      )

      const progress = engine.getGameState()
      expect(progress?.totalScore).toBeGreaterThan(0)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset game progress', () => {
      engine.startGame()
      engine.submitRoomResult(
        'room1_helm',
        { order: ['Plan', 'Decide', 'Communicate', 'Act'] },
        10
      )

      engine.resetGame()

      const progress = engine.getGameState()
      expect(progress).toBeNull()
    })
  })
})

