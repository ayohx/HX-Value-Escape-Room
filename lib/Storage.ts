import { PlayerProgress, RoomProgress } from './types'

const STORAGE_KEY = 'hx-escape-room-progress'

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return `anon-${crypto.randomUUID()}`
}

/**
 * Get current player progress from localStorage
 */
export function getPlayerProgress(): PlayerProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const progress: PlayerProgress = JSON.parse(stored)
    return progress
  } catch (error) {
    console.error('Failed to load player progress:', error)
    return null
  }
}

/**
 * Save player progress to localStorage
 */
export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return

  try {
    progress.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error('Failed to save player progress:', error)
  }
}

/**
 * Initialize new player progress
 */
export function initializePlayerProgress(roomIds: string[]): PlayerProgress {
  const progress: PlayerProgress = {
    playerId: generatePlayerId(),
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    currentRoomId: roomIds[0] || null,
    rooms: {},
    totalScore: 0,
  }

  // Initialize all rooms as locked except the first
  roomIds.forEach((roomId, index) => {
    progress.rooms[roomId] = {
      status: index === 0 ? 'in_progress' : 'locked',
      attempts: 0,
    }
  })

  savePlayerProgress(progress)
  return progress
}

/**
 * Update room progress
 */
export function updateRoomProgress(
  roomId: string,
  roomProgress: Partial<RoomProgress>
): void {
  const progress = getPlayerProgress()
  if (!progress) return

  progress.rooms[roomId] = {
    ...progress.rooms[roomId],
    ...roomProgress,
  }

  savePlayerProgress(progress)
}

/**
 * Mark room as completed and unlock next room
 */
export function completeRoom(
  roomId: string,
  roomIds: string[],
  timeTaken: number,
  score: number = 100,
  choices?: string[]
): void {
  const progress = getPlayerProgress()
  if (!progress) return

  // Update current room
  progress.rooms[roomId] = {
    ...progress.rooms[roomId],
    status: 'completed',
    timeTakenSec: timeTaken,
    choices: choices || progress.rooms[roomId].choices,
    score,
  }

  // Update total score
  progress.totalScore += score

  // Unlock next room
  const currentIndex = roomIds.indexOf(roomId)
  if (currentIndex >= 0 && currentIndex < roomIds.length - 1) {
    const nextRoomId = roomIds[currentIndex + 1]
    if (progress.rooms[nextRoomId]) {
      progress.rooms[nextRoomId].status = 'in_progress'
    }
    progress.currentRoomId = nextRoomId
  } else if (currentIndex === roomIds.length - 1) {
    // All rooms completed
    progress.completedAt = new Date().toISOString()
    progress.currentRoomId = null
  }

  savePlayerProgress(progress)
}

/**
 * Increment room attempts
 */
export function incrementRoomAttempts(roomId: string): void {
  const progress = getPlayerProgress()
  if (!progress || !progress.rooms[roomId]) return

  progress.rooms[roomId].attempts += 1
  savePlayerProgress(progress)
}

/**
 * Use a hint for a room
 */
export function useHint(roomId: string): void {
  const progress = getPlayerProgress()
  if (!progress || !progress.rooms[roomId]) return

  progress.rooms[roomId].hintsUsed = (progress.rooms[roomId].hintsUsed || 0) + 1
  savePlayerProgress(progress)
}

/**
 * Reset all progress
 */
export function resetProgress(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to reset progress:', error)
  }
}

/**
 * Check if player has progress
 */
export function hasProgress(): boolean {
  return getPlayerProgress() !== null
}


