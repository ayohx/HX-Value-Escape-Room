import { create } from 'zustand'
import { GameState, PlayerProgress, GameEvent, GameEventListener, RoomConfig } from '@/lib/types'
import { getPlayerProgress, savePlayerProgress } from '@/lib/Storage'

interface GameStore {
  // State
  gameState: GameState
  currentRoomId: string | null
  playerProgress: PlayerProgress | null
  currentRoomConfig: RoomConfig | null
  roomStartTime: number | null
  eventListeners: GameEventListener[]

  // Actions
  setGameState: (state: GameState) => void
  setCurrentRoom: (roomId: string | null, config?: RoomConfig | null) => void
  setPlayerProgress: (progress: PlayerProgress | null) => void
  startRoomTimer: () => void
  getRoomElapsedTime: () => number
  addEventListener: (listener: GameEventListener) => void
  removeEventListener: (listener: GameEventListener) => void
  emitEvent: (event: GameEvent) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: 'idle',
  currentRoomId: null,
  playerProgress: null,
  currentRoomConfig: null,
  roomStartTime: null,
  eventListeners: [],

  // Actions
  setGameState: (state: GameState) => {
    set({ gameState: state })
  },

  setCurrentRoom: (roomId: string | null, config?: RoomConfig | null) => {
    set({ currentRoomId: roomId, currentRoomConfig: config || null })
  },

  setPlayerProgress: (progress: PlayerProgress | null) => {
    set({ playerProgress: progress })
    if (progress) {
      savePlayerProgress(progress)
    }
  },

  startRoomTimer: () => {
    set({ roomStartTime: Date.now() })
  },

  getRoomElapsedTime: () => {
    const { roomStartTime } = get()
    if (!roomStartTime) return 0
    return Math.floor((Date.now() - roomStartTime) / 1000)
  },

  addEventListener: (listener: GameEventListener) => {
    set((state) => ({
      eventListeners: [...state.eventListeners, listener],
    }))
  },

  removeEventListener: (listener: GameEventListener) => {
    set((state) => ({
      eventListeners: state.eventListeners.filter((l) => l !== listener),
    }))
  },

  emitEvent: (event: GameEvent) => {
    const { eventListeners } = get()
    eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  },

  reset: () => {
    set({
      gameState: 'idle',
      currentRoomId: null,
      playerProgress: null,
      currentRoomConfig: null,
      roomStartTime: null,
    })
  },
}))

