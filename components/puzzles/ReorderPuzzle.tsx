'use client'

import { useState, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'
import Button from '@/components/ui/Button'

interface ReorderPuzzleProps {
  items: string[]
  correctOrder: string[]
  onSubmit: (order: string[]) => void
  disabled?: boolean
}

export default function ReorderPuzzle({
  items,
  correctOrder,
  onSubmit,
  disabled = false,
}: ReorderPuzzleProps) {
  const [orderedItems, setOrderedItems] = useState<string[]>(items)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Handle keyboard reordering
  const moveItem = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

      if (toIndex < 0 || toIndex >= orderedItems.length) return

      const newOrder = [...orderedItems]
      const [movedItem] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, movedItem)

      setOrderedItems(newOrder)
      setSelectedIndex(toIndex)
    },
    [orderedItems]
  )

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault()
        moveItem(index, 'up')
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault()
        moveItem(index, 'down')
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        setSelectedIndex(selectedIndex === index ? null : index)
        break
    }
  }

  const handleSubmit = () => {
    onSubmit(orderedItems)
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Drag items to reorder them, or use keyboard:
        </p>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
          <span>↑/↓ or W/S = Move</span>
          <span>Space/Enter = Select</span>
        </div>
      </div>

      {/* Reorderable list */}
      <Reorder.Group
        axis="y"
        values={orderedItems}
        onReorder={setOrderedItems}
        className="space-y-3"
        role="list"
        aria-label="Command chain items - reorder to solve puzzle"
      >
        {orderedItems.map((item, index) => (
          <Reorder.Item
            key={item}
            value={item}
            className="list-none"
            disabled={disabled}
          >
            <motion.div
              layout
              className={`
                p-4 rounded-lg border-2 cursor-move
                transition-all duration-200
                ${
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              tabIndex={disabled ? -1 : 0}
              role="listitem"
              aria-label={`${item}, position ${index + 1} of ${orderedItems.length}. Press arrow keys to reorder.`}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => !disabled && setSelectedIndex(selectedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-4">
                {/* Drag handle */}
                <div className="flex flex-col gap-1 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>

                {/* Position number */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {index + 1}
                </div>

                {/* Item text */}
                <div className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {item}
                </div>

                {/* Arrow indicators */}
                {!disabled && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveItem(index, 'up')
                      }}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                      aria-label={`Move ${item} up`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveItem(index, 'down')
                      }}
                      disabled={index === orderedItems.length - 1}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                      aria-label={`Move ${item} down`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Submit button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          size="lg"
          className="min-w-[200px]"
        >
          Submit Order
        </Button>
      </div>

      {/* Live region for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Current order: {orderedItems.join(', ')}
      </div>
    </div>
  )
}

