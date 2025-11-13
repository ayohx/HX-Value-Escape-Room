'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface Choice {
  id: string
  label: string
  outcome?: string
}

interface TimedChoiceProps {
  choices: Choice[]
  timeLimit: number
  onSubmit: (choiceId: string) => void
  onTimeout?: () => void
  disabled?: boolean
}

export default function TimedChoice({
  choices,
  timeLimit,
  onSubmit,
  onTimeout,
  disabled = false,
}: TimedChoiceProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (disabled || hasTimedOut) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setHasTimedOut(true)
          onTimeout?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [disabled, hasTimedOut, onTimeout])

  const handleSubmit = () => {
    if (selectedChoice && !disabled && !hasTimedOut) {
      onSubmit(selectedChoice)
    }
  }

  const progressPercentage = (timeRemaining / timeLimit) * 100
  const isWarning = timeRemaining <= 10

  // Announce time warnings to screen readers
  useEffect(() => {
    if (timeRemaining === 10 || timeRemaining === 5) {
      const announcement = document.getElementById('timer-announcement')
      if (announcement) {
        announcement.textContent = `Warning: ${timeRemaining} seconds remaining`
      }
    }
  }, [timeRemaining])

  return (
    <div className="space-y-6">
      {/* Timer progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Remaining
          </span>
          <motion.span
            className={`text-2xl font-bold ${
              isWarning ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
            }`}
            animate={isWarning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isWarning ? Infinity : 0 }}
          >
            {timeRemaining}s
          </motion.span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              isWarning ? 'bg-red-600' : 'bg-blue-600'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Choices */}
      <div
        className="space-y-3"
        role="radiogroup"
        aria-label="Choose an override strategy"
      >
        {choices.map((choice, index) => {
          const isSelected = selectedChoice === choice.id

          return (
            <motion.button
              key={choice.id}
              onClick={() => !disabled && !hasTimedOut && setSelectedChoice(choice.id)}
              disabled={disabled || hasTimedOut}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-md'
                }
                ${disabled || hasTimedOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600
              `}
              whileHover={!disabled && !hasTimedOut ? { scale: 1.02 } : {}}
              whileTap={!disabled && !hasTimedOut ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              role="radio"
              aria-checked={isSelected}
              aria-label={choice.label}
            >
              <div className="flex items-center gap-4">
                {/* Radio indicator */}
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-400 dark:border-gray-500'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      className="w-3 h-3 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>

                {/* Choice text */}
                <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                  {choice.label}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Timeout message */}
      {hasTimedOut && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg text-center"
        >
          <p className="text-red-800 dark:text-red-200 font-semibold">
            ⏰ Time's up! The breach continues spreading...
          </p>
        </motion.div>
      )}

      {/* Submit button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedChoice || disabled || hasTimedOut}
          size="lg"
          className="min-w-[200px]"
        >
          {hasTimedOut ? 'Time Expired' : 'Execute Strategy'}
        </Button>
      </div>

      {/* Screen reader announcements */}
      <div
        id="timer-announcement"
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      />
    </div>
  )
}


