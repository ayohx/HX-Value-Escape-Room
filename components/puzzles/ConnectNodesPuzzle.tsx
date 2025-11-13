'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface Choice {
  id: string
  label: string
  result: string
}

interface ConnectNodesPuzzleProps {
  step1Choices: Choice[]
  onSubmit: (step1Choice: string, puzzleCompleted: boolean) => void
  disabled?: boolean
}

export default function ConnectNodesPuzzle({
  step1Choices,
  onSubmit,
  disabled = false,
}: ConnectNodesPuzzleProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Choice, setStep1Choice] = useState<string | null>(null)
  const [connectedNodes, setConnectedNodes] = useState<Set<string>>(new Set())

  // 3x3 grid of nodes - center is starting point
  const nodes = [
    { id: 'n1', x: 0, y: 0, label: '1' },
    { id: 'n2', x: 1, y: 0, label: '2' },
    { id: 'n3', x: 2, y: 0, label: '3' },
    { id: 'n4', x: 0, y: 1, label: '4' },
    { id: 'n5', x: 1, y: 1, label: '5' }, // Center - starting point
    { id: 'n6', x: 2, y: 1, label: '6' },
    { id: 'n7', x: 0, y: 2, label: '7' },
    { id: 'n8', x: 1, y: 2, label: '8' },
    { id: 'n9', x: 2, y: 2, label: '9' },
  ]

  const handleStep1Submit = () => {
    if (step1Choice) {
      setStep(2)
      setConnectedNodes(new Set(['n5'])) // Start from center
    }
  }

  const toggleNode = useCallback(
    (nodeId: string) => {
      if (disabled) return

      const newConnected = new Set(connectedNodes)
      if (newConnected.has(nodeId)) {
        newConnected.delete(nodeId)
      } else {
        newConnected.add(nodeId)
      }
      setConnectedNodes(newConnected)
    },
    [connectedNodes, disabled]
  )

  const handleFinalSubmit = () => {
    // Simple validation: check if enough nodes are connected (at least 5 including center)
    const puzzleCompleted = connectedNodes.size >= 5
    onSubmit(step1Choice!, puzzleCompleted)
  }

  const isNodeConnected = (nodeId: string) => connectedNodes.has(nodeId)

  return (
    <div className="space-y-6">
      {/* Step 1: Colleague Response */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            Step 1: Choose your response
          </p>

          <div
            className="space-y-3"
            role="radiogroup"
            aria-label="Choose how to respond to colleague's mistake"
          >
            {step1Choices.map((choice, index) => {
              const isSelected = step1Choice === choice.id

              return (
                <motion.button
                  key={choice.id}
                  onClick={() => !disabled && setStep1Choice(choice.id)}
                  disabled={disabled}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${
                      isSelected
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-400 hover:shadow-md'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600
                  `}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${
                          isSelected
                            ? 'border-green-600 bg-green-600'
                            : 'border-gray-400 dark:border-gray-500'
                        }
                      `}
                    >
                      {isSelected && (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                      {choice.label}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStep1Submit}
              disabled={!step1Choice || disabled}
              size="lg"
              className="min-w-[200px]"
            >
              Continue to Grid Repair
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Connect Nodes */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
            Step 2: Connect the nodes (click to toggle connections)
          </p>

          {/* 3x3 Grid */}
          <div className="relative max-w-md mx-auto aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
            {nodes.map((node) => {
              const isConnected = isNodeConnected(node.id)
              const isCenter = node.id === 'n5'
              const posX = (node.x / 2) * 100
              const posY = (node.y / 2) * 100

              return (
                <motion.button
                  key={node.id}
                  onClick={() => toggleNode(node.id)}
                  disabled={disabled}
                  className={`
                    absolute w-16 h-16 rounded-full border-4 font-bold text-lg
                    transition-all duration-200
                    ${
                      isConnected
                        ? 'border-green-600 bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                    ${isCenter ? 'border-blue-600 bg-blue-500 text-white' : ''}
                    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600
                  `}
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  whileHover={!disabled ? { scale: 1.1 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: parseInt(node.label) * 0.05 }}
                  aria-label={`Node ${node.label} ${isConnected ? 'connected' : 'disconnected'}. ${isCenter ? 'Starting point.' : 'Click to toggle connection.'}`}
                  aria-pressed={isConnected}
                >
                  {node.label}
                </motion.button>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Connected nodes: {connectedNodes.size} / 9
            {connectedNodes.size >= 5 && ' ✓ Minimum reached!'}
          </p>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleFinalSubmit}
              disabled={connectedNodes.size < 5 || disabled}
              size="lg"
              className="min-w-[200px]"
            >
              Complete Repair
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

