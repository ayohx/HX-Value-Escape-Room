'use client'

import { ReactNode } from 'react'
import AICore from './AICore'
import { RoomStatus } from '@/lib/types'

interface HUDProps {
  rooms: {
    id: string
    title: string
    value: string
    status: RoomStatus
  }[]
  currentRoomId?: string
  onRoomClick?: (roomId: string) => void
  children: ReactNode
}

export default function HUD({ rooms, currentRoomId, onRoomClick, children }: HUDProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - AI Core (desktop) */}
          <aside className="hidden lg:block lg:col-span-3" aria-label="Game progress">
            <div className="sticky top-6">
              <AICore
                rooms={rooms}
                currentRoomId={currentRoomId}
                onRoomClick={onRoomClick}
              />
            </div>
          </aside>

          {/* Main content area */}
          <main className="lg:col-span-9">
            {children}
          </main>

          {/* Mobile AI Core - collapsible at bottom */}
          <div className="lg:hidden">
            <details className="bg-gray-900 rounded-lg border border-gray-700">
              <summary className="p-4 cursor-pointer font-semibold text-white hover:bg-gray-800 rounded-lg transition-colors">
                View Mission Progress
              </summary>
              <div className="p-4 pt-0">
                <AICore
                  rooms={rooms}
                  currentRoomId={currentRoomId}
                  onRoomClick={onRoomClick}
                />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}


