'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface RoomStageProps {
  roomTitle?: string
  roomValue?: string
  instruction?: string
  children: ReactNode
  onHint?: () => void
  hintAvailable?: boolean
  hintsUsed?: number
  showTimer?: boolean
  timeRemaining?: number
  footer?: ReactNode
}

export default function RoomStage({
  roomTitle,
  roomValue,
  instruction,
  children,
  onHint,
  hintAvailable = true,
  hintsUsed = 0,
  showTimer = false,
  timeRemaining,
  footer,
}: RoomStageProps) {
  const isTimerWarning = showTimer && timeRemaining !== undefined && timeRemaining < 10

  return (
    <div className="space-y-6">
      {/* Room header */}
      {(roomTitle || roomValue) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated" padding="md" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {roomValue && (
                  <div className="text-sm font-medium opacity-90 mb-1">
                    {roomValue}
                  </div>
                )}
                {roomTitle && (
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {roomTitle}
                  </h2>
                )}
              </div>

              {/* Timer */}
              {showTimer && timeRemaining !== undefined && (
                <motion.div
                  className={`
                    flex items-center justify-center w-20 h-20 rounded-full border-4
                    ${isTimerWarning ? 'border-red-400 bg-red-500/20' : 'border-white/50 bg-white/10'}
                  `}
                  animate={isTimerWarning ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isTimerWarning ? Infinity : 0 }}
                  role="timer"
                  aria-live="polite"
                  aria-label={`${timeRemaining} seconds remaining`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeRemaining}</div>
                    <div className="text-xs opacity-75">sec</div>
                  </div>
                </motion.div>
              )}

              {/* Hint button */}
              {onHint && (
                <Button
                  onClick={onHint}
                  disabled={!hintAvailable}
                  variant="ghost"
                  className="text-white border-2 border-white/50 hover:bg-white/20"
                  aria-label={`Use hint. ${hintsUsed} hints used so far`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Hint
                  {hintsUsed > 0 && (
                    <span className="ml-1 text-xs opacity-75">({hintsUsed} used)</span>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Instruction */}
      {instruction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card padding="md" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-gray-800 dark:text-gray-200 font-medium" role="status">
                {instruction}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main puzzle area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          {children}
        </Card>
      </motion.div>

      {/* Footer actions */}
      {footer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {footer}
        </motion.div>
      )}
    </div>
  )
}


