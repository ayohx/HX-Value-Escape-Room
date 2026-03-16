'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { gameEngine } from '@/lib/GameEngine'
import { useGameStore } from '@/stores/gameStore'
import Header from '@/components/layout/Header'
import HUD from '@/components/layout/HUD'
import RoomStage from '@/components/layout/RoomStage'
import Toast from '@/components/ui/Toast'

// Import puzzle components
import ReorderPuzzle from '@/components/puzzles/ReorderPuzzle'
import TimedChoice from '@/components/puzzles/TimedChoice'
import ConnectNodesPuzzle from '@/components/puzzles/ConnectNodesPuzzle'
import MatchingChoice from '@/components/puzzles/MatchingChoice'
import FinalPuzzle from '@/components/puzzles/FinalPuzzle'

export default function PlayPage() {
  const router = useRouter()
  const {
    gameState,
    currentRoomId,
    playerProgress,
    currentRoomConfig,
    setGameState,
    setCurrentRoom,
    setPlayerProgress,
    startRoomTimer,
    getRoomElapsedTime,
  } = useGameStore()

  const [showBriefing, setShowBriefing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<{
    success: boolean
    message: string
    learning?: string
  } | null>(null)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: any } | null>(null)
  const [additionalEvent, setAdditionalEvent] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined)

  // Initialize game on mount
  useEffect(() => {
    const progress = gameEngine.startGame()
    setPlayerProgress(progress)
    
    if (progress.currentRoomId) {
      const room = gameEngine.getRoomById(progress.currentRoomId)
      if (room) {
        setCurrentRoom(progress.currentRoomId, room)
        setGameState('briefing')
        setShowBriefing(true)
      }
    }
  }, [setPlayerProgress, setCurrentRoom, setGameState])

  // Start room after briefing
  const startCurrentRoom = useCallback(() => {
    if (currentRoomId) {
      gameEngine.startRoom(currentRoomId)
      setGameState('playing')
      setShowBriefing(false)
      startRoomTimer()
    }
  }, [currentRoomId, setGameState, startRoomTimer])

  // Handle room submission
  const handleRoomSubmit = useCallback(async (payload: any) => {
    if (!currentRoomId) return

    const timeTaken = getRoomElapsedTime()
    const result = gameEngine.submitRoomResult(currentRoomId, payload, timeTaken)

    if (result.success) {
      setGameState('result_success')
      setResultData({
        success: true,
        message: result.message,
        learning: result.learning,
      })
      setShowResult(true)

      // Check if there's an additional event (Room 2 red button)
      if (result.nextEvent) {
        setAdditionalEvent(result.nextEvent)
      }

      // Check if all rooms completed
      if (gameEngine.checkAllRoomsCompleted()) {
        setTimeout(() => {
          setShowCompletionModal(true)
        }, 2000)
      }
    } else {
      setGameState('result_fail')
      setResultData({
        success: false,
        message: result.message,
      })
      setShowResult(true)
    }

    // Reload progress
    const updatedProgress = gameEngine.getGameState()
    if (updatedProgress) {
      setPlayerProgress(updatedProgress)
    }
  }, [currentRoomId, getRoomElapsedTime, setGameState, setPlayerProgress])

  // Handle additional event submission
  const handleAdditionalEventSubmit = useCallback((eventChoiceId: string) => {
    if (!additionalEvent || !currentRoomId) return

    const outcome = additionalEvent.outcomes[eventChoiceId]
    if (outcome) {
      setToast({ message: outcome.learning, type: 'success' })
    }

    setAdditionalEvent(null)
  }, [additionalEvent, currentRoomId])

  // Continue to next room
  const continueToNextRoom = useCallback(() => {
    setShowResult(false)
    setResultData(null)

    const progress = gameEngine.getGameState()
    if (progress && progress.currentRoomId) {
      const room = gameEngine.getRoomById(progress.currentRoomId)
      if (room) {
        setCurrentRoom(progress.currentRoomId, room)
        setGameState('briefing')
        setShowBriefing(true)
      }
    }
  }, [setCurrentRoom, setGameState])

  // Retry current room
  const retryRoom = useCallback(() => {
    setShowResult(false)
    setResultData(null)
    setGameState('playing')
    startRoomTimer()
  }, [setGameState, startRoomTimer])

  // Handle pause
  const handlePause = useCallback(() => {
    setShowPauseModal(true)
  }, [])

  // Handle exit
  const handleExit = useCallback(() => {
    router.push('/')
  }, [router])

  // Handle reset
  const handleReset = useCallback(() => {
    if (window.confirm('Reset the game and start from Room 1?')) {
      gameEngine.resetGame()
      window.location.reload()
    }
  }, [])

  // Render puzzle based on room type
  const renderPuzzle = () => {
    if (!currentRoomConfig) return null

    switch (currentRoomConfig.type) {
      case 'reorder':
        return (
          <ReorderPuzzle
            items={currentRoomConfig.task.items}
            correctOrder={currentRoomConfig.task.correctOrder}
            onSubmit={(order) => handleRoomSubmit({ order })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'timed-choice':
        return (
          <TimedChoice
            choices={currentRoomConfig.task.choices}
            timeLimit={currentRoomConfig.task.timeLimitSeconds}
            onSubmit={(choiceId) => handleRoomSubmit({ choiceId })}
            onTimeout={() => handleRoomSubmit({ choiceId: 'timeout' })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'multi-step':
        return (
          <ConnectNodesPuzzle
            step1Choices={currentRoomConfig.task.steps[0].choices}
            onSubmit={(step1Choice, puzzleCompleted) =>
              handleRoomSubmit({ step1Choice, puzzleCompleted })
            }
            disabled={gameState !== 'playing'}
          />
        )

      case 'matching-choice':
        return (
          <MatchingChoice
            pairs={currentRoomConfig.task.pairs}
            powerUpChoices={currentRoomConfig.task.powerUpChoices}
            onSubmit={(powerUpChoice) => handleRoomSubmit({ powerUpChoice })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'choice-final':
        return (
          <FinalPuzzle
            mainChoices={currentRoomConfig.task.choices}
            finalQuestion={currentRoomConfig.finalPuzzle.instruction}
            finalChoices={currentRoomConfig.finalPuzzle.choices}
            onSubmit={(mainChoice, finalChoice) =>
              handleRoomSubmit({ mainChoice, finalChoice })
            }
            disabled={gameState !== 'playing'}
          />
        )

      default:
        return <div className="text-center">Unknown puzzle type</div>
    }
  }

  // Get rooms for HUD
  const rooms = gameEngine.getRooms().map((room) => ({
    id: room.id,
    title: room.roomTitle,
    value: room.value,
    status: playerProgress?.rooms[room.id]?.status || 'locked',
  }))

  const currentRoomIndex = currentRoomId
    ? gameEngine.getRoomIds().indexOf(currentRoomId) + 1
    : 0

  // Map room IDs to badge images
  const roomBadges: Record<string, string> = {
    room1_helm: '/assets/placeholders/room-helm.gif',
    room2_firewall: '/assets/placeholders/room-firewall.gif',
    room3_one_team: '/assets/placeholders/room-connection.gif',
    room4_upgrade: '/assets/placeholders/room-upgrade.gif',
    room5_innovation: '/assets/placeholders/room-innovation.gif',
  }

  return (
    <>
      <Header
        currentRoomIndex={currentRoomIndex}
        totalRooms={5}
        onPause={handlePause}
        onExit={handleExit}
        onReset={handleReset}
        showProgress={true}
      />

      <HUD rooms={rooms} currentRoomId={currentRoomId || undefined}>
        {gameState === 'playing' && currentRoomConfig && (
          <RoomStage
            roomTitle={currentRoomConfig.roomTitle}
            roomValue={currentRoomConfig.value}
            instruction={currentRoomConfig.task.instruction}
            onHint={() => {
              if (currentRoomId) {
                gameEngine.useHint(currentRoomId)
                const hint = currentRoomConfig?.onSuccess?.learning || 'Think carefully about the values — what would a great teammate do?'
                setToast({ message: `💡 Hint: ${hint}`, type: 'info' })
              }
            }}
            hintAvailable={true}
            hintsUsed={playerProgress?.rooms[currentRoomId!]?.hintsUsed || 0}
            showTimer={currentRoomConfig.task.timeLimitSeconds !== null}
            timeRemaining={timeRemaining}
          >
            {renderPuzzle()}
          </RoomStage>
        )}

        {gameState === 'briefing' && <div className="text-center">Loading briefing...</div>}
      </HUD>

      {/* Mission Briefing — HX Branded */}
      <AnimatePresence>
        {showBriefing && currentRoomConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 25px 60px rgba(84,46,145,0.45), 0 8px 24px rgba(0,0,0,0.4)' }}
            >
              {/* ── Purple Header ── */}
              <div
                className="relative px-8 pt-8 pb-10 text-white text-center overflow-hidden"
                style={{ background: 'linear-gradient(140deg, #6b3aad 0%, #542E91 45%, #3a1d6e 100%)' }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.18) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.12) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

                {/* MISSION BRIEFING badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-black tracking-widest uppercase relative"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}
                >
                  <span>⚡</span> Mission Briefing
                </motion.div>

                {/* GIF — on dark purple, now fully visible */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex justify-center mb-5 relative"
                >
                  <div
                    className="w-32 h-32 relative rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '2px solid rgba(253,220,6,0.4)',
                      boxShadow: '0 0 30px rgba(253,220,6,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    <Image
                      src={roomBadges[currentRoomConfig.id] || '/assets/placeholders/room-helm.gif'}
                      alt={currentRoomConfig.value}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                </motion.div>

                {/* Room number */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'rgba(253,220,6,0.75)' }}
                >
                  Room {currentRoomIndex} of 5
                </motion.p>

                {/* Room title */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="text-3xl font-black tracking-tight mb-4 leading-tight"
                >
                  {currentRoomConfig.roomTitle}
                </motion.h2>

                {/* Value pill */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 }}
                  className="inline-flex items-center px-5 py-1.5 rounded-full text-sm font-black"
                  style={{ background: '#FDDC06', color: '#232323' }}
                >
                  {currentRoomConfig.value}
                </motion.span>

                {/* Room progress dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32 }}
                  className="flex justify-center gap-2 mt-5"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="rounded-full transition-all"
                      style={{
                        width: n === currentRoomIndex ? 20 : 8,
                        height: 8,
                        background: n < currentRoomIndex
                          ? '#FDDC06'
                          : n === currentRoomIndex
                          ? '#FDDC06'
                          : 'rgba(255,255,255,0.25)',
                        opacity: n < currentRoomIndex ? 0.6 : 1,
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* ── White Body ── */}
              <div className="bg-white px-7 py-6 space-y-5">
                {/* Objective */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-xl p-4"
                  style={{ background: '#F0F0F0', borderLeft: '4px solid #542E91' }}
                >
                  <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#542E91' }}>
                    Your Objective
                  </p>
                  <p className="text-gray-700 font-semibold leading-relaxed text-sm">
                    {currentRoomConfig.task.instruction}
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={startCurrentRoom}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl text-lg font-black tracking-wide transition-shadow"
                  style={{
                    background: '#FDDC06',
                    color: '#232323',
                    boxShadow: '0 4px 20px rgba(253,220,6,0.5)',
                  }}
                >
                  ⚡ Start Challenge
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Modal — HX Branded */}
      <AnimatePresence>
        {showResult && resultData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 25px 60px rgba(84,46,145,0.45), 0 8px 24px rgba(0,0,0,0.4)' }}
            >
              {/* Header */}
              <div className="relative px-8 pt-8 pb-10 text-white text-center overflow-hidden"
                style={{ background: resultData.success
                  ? 'linear-gradient(140deg, #6b3aad 0%, #542E91 45%, #3a1d6e 100%)'
                  : 'linear-gradient(140deg, #7c3aed 0%, #4c1d95 50%, #2d1550 100%)' }}>
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.15) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.1) 0%, transparent 70%)' }} />

                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-black tracking-widest uppercase"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}
                >
                  {resultData.success ? '✅ Mission Complete' : '🔄 Try Again'}
                </motion.div>

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
                  className="text-7xl mb-3"
                >
                  {resultData.success ? '🎉' : '🔄'}
                </motion.div>

                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xl font-black leading-snug">
                  {resultData.message}
                </motion.p>
              </div>

              {/* Body */}
              <div className="bg-white px-7 py-6 space-y-4">
                {resultData.learning && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl p-4"
                    style={{ background: '#F0F0F0', borderLeft: '4px solid #542E91' }}>
                    <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#542E91' }}>
                      The HX Value
                    </p>
                    <p className="text-gray-700 font-semibold leading-relaxed text-sm italic">
                      &quot;{resultData.learning}&quot;
                    </p>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3">
                  {resultData.success ? (
                    <button onClick={continueToNextRoom}
                      className="flex-1 py-4 rounded-2xl text-lg font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: '#FDDC06', color: '#232323', boxShadow: '0 4px 20px rgba(253,220,6,0.4)' }}>
                      Continue →
                    </button>
                  ) : (
                    <>
                      <button onClick={handleExit}
                        className="flex-1 py-4 rounded-2xl text-base font-bold border-2 transition-all hover:scale-[1.02]"
                        style={{ borderColor: '#542E91', color: '#542E91' }}>
                        Exit
                      </button>
                      <button onClick={retryRoom}
                        className="flex-1 py-4 rounded-2xl text-lg font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: '#FDDC06', color: '#232323', boxShadow: '0 4px 20px rgba(253,220,6,0.4)' }}>
                        ↺ Retry
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Additional Event (Room 2 Red Button) — HX Branded */}
      <AnimatePresence>
        {!!additionalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 25px 60px rgba(84,46,145,0.5)' }}
            >
              <div className="relative px-8 pt-8 pb-10 text-white text-center overflow-hidden"
                style={{ background: 'linear-gradient(140deg, #7c1d1d 0%, #9b2020 40%, #542E91 100%)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(255,80,80,0.15) 0%, transparent 60%)' }} />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-black tracking-widest uppercase"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}>
                  ⚠️ Decision Point
                </div>
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-7xl mb-4">🔴</motion.div>
                <p className="text-xl font-black leading-snug">{additionalEvent?.instruction}</p>
              </div>
              <div className="bg-white px-7 py-6">
                <div className="flex gap-3">
                  {additionalEvent?.choices.map((choice: any, i: number) => (
                    <button key={choice.id} onClick={() => handleAdditionalEventSubmit(choice.id)}
                      className="flex-1 py-4 rounded-2xl text-lg font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={i === 0
                        ? { background: '#FDDC06', color: '#232323', boxShadow: '0 4px 20px rgba(253,220,6,0.4)' }
                        : { background: '#542E91', color: '#fff', boxShadow: '0 4px 20px rgba(84,46,145,0.3)' }
                      }>
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pause Modal — HX Branded */}
      <AnimatePresence>
        {showPauseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPauseModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 25px 60px rgba(84,46,145,0.45)' }}
            >
              <div className="relative px-8 pt-7 pb-8 text-white text-center overflow-hidden"
                style={{ background: 'linear-gradient(140deg, #6b3aad 0%, #542E91 45%, #3a1d6e 100%)' }}>
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.15) 0%, transparent 70%)' }} />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-black tracking-widest uppercase"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}>
                  ⏸ Game Paused
                </div>
                <div className="text-5xl mb-3">☕</div>
                <p className="text-white/80 text-sm font-semibold">
                  Progress automatically saved — take your time!
                </p>
              </div>
              <div className="bg-white px-7 py-5 flex gap-3">
                <button onClick={handleExit}
                  className="flex-1 py-3.5 rounded-2xl text-base font-bold border-2 transition-all hover:scale-[1.02]"
                  style={{ borderColor: '#542E91', color: '#542E91' }}>
                  Exit
                </button>
                <button onClick={() => setShowPauseModal(false)}
                  className="flex-1 py-3.5 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: '#FDDC06', color: '#232323', boxShadow: '0 4px 14px rgba(253,220,6,0.4)' }}>
                  ▶ Resume
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal — HX Branded */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 30px 80px rgba(84,46,145,0.6)' }}
            >
              {/* Epic purple header */}
              <div className="relative px-8 pt-8 pb-10 text-white text-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #542E91 40%, #3a1d6e 80%, #1e0a40 100%)' }}>
                <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.2) 0%, transparent 60%)' }} />
                <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.15) 0%, transparent 65%)' }} />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-black tracking-widest uppercase"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}>
                  🏆 AI Core Restored
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 15 }}
                  className="text-8xl mb-4">🏆</motion.div>

                <h2 className="text-3xl font-black mb-3 leading-tight">
                  All Five HX Values Restored!
                </h2>
                <p className="text-white/75 text-sm font-semibold leading-relaxed">
                  The AI Core is fully operational. You&apos;ve demonstrated all five Holiday Extras values.
                </p>

                {/* 5 value badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {['Be At The Helm', 'Be Courageous', 'Be One Team', 'Be The Best Version of You', 'Be Pioneering'].map((v) => (
                    <span key={v} className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.4)', color: '#FDDC06' }}>
                      ✓ {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-7 py-6 space-y-4">
                {/* Score */}
                <div className="rounded-2xl p-5 text-center"
                  style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #fefce8 100%)', border: '2px solid #542E91' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#542E91' }}>Your Final Score</p>
                  <p className="text-5xl font-black" style={{ color: '#542E91' }}>
                    {playerProgress?.totalScore || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">points</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleExit}
                    className="flex-1 py-3.5 rounded-2xl text-base font-bold border-2 transition-all hover:scale-[1.02]"
                    style={{ borderColor: '#542E91', color: '#542E91' }}>
                    Back to Menu
                  </button>
                  <button onClick={() => { gameEngine.resetGame(); window.location.reload() }}
                    className="flex-1 py-3.5 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: '#FDDC06', color: '#232323', boxShadow: '0 4px 20px rgba(253,220,6,0.4)' }}>
                    ↺ Play Again
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </>
  )
}
