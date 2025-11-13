'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'

interface HeaderProps {
  currentRoomIndex?: number
  totalRooms?: number
  onPause?: () => void
  onExit?: () => void
  showProgress?: boolean
}

export default function Header({
  currentRoomIndex = 0,
  totalRooms = 5,
  onPause,
  onExit,
  showProgress = true,
}: HeaderProps) {
  const progress = totalRooms > 0 ? ((currentRoomIndex) / totalRooms) * 100 : 0

  return (
    <header className="bg-gray-900 text-white border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Title */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xl font-bold hover:text-blue-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
            >
              HX Arcade Escape Room
            </Link>
          </div>

          {/* Center: Progress */}
          {showProgress && (
            <div className="hidden md:flex items-center space-x-3 flex-1 max-w-md mx-8">
              <span className="text-sm font-medium whitespace-nowrap">
                Room {currentRoomIndex} / {totalRooms}
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={progress}
                  size="sm"
                  variant="success"
                  animate={false}
                />
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {onPause && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                className="text-white hover:bg-gray-800"
                aria-label="Pause"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="ml-2 hidden sm:inline">Pause</span>
              </Button>
            )}
            {onExit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-white hover:bg-gray-800"
                aria-label="Exit"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="ml-2 hidden sm:inline">Exit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile progress */}
        {showProgress && (
          <div className="md:hidden pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium whitespace-nowrap">
                Room {currentRoomIndex} / {totalRooms}
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={progress}
                  size="sm"
                  variant="success"
                  animate={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

