'use client'

import { CardRenderer } from './CardRenderer'
import { cn } from '@/lib/utils'

import type { StudyCard as Card } from '@/types/content'

interface CardFaceProps {
  card: Card
  isFlipped: boolean
  onClick: () => void
  isAnimating: boolean
  className?: string
}

export function CardFace({ card, isFlipped, onClick, isAnimating, className }: CardFaceProps) {
  return (
    <div
      className={cn('group perspective-1000 relative cursor-pointer', className)}
      onClick={onClick}
    >
      <div
        className={cn(
          'transform-style-preserve-3d relative h-full w-full transition-transform duration-calm ease-standard',
          isFlipped && 'rotate-y-180',
          isAnimating && 'pointer-events-none'
        )}
      >
        {/* カード表面(問い) */}
        <div className="backface-hidden absolute inset-0">
          <div className="h-full w-full rounded-card bg-surface shadow-card">
            <div className="absolute left-4 right-4 top-4 border-b border-line pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">問い</span>
                <span className="text-xs text-disabled">クリックして裏面へ</span>
              </div>
            </div>

            <div className="flex h-full items-center justify-center p-6 pt-16">
              <CardRenderer cardData={card} side="front" className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* カード裏面(答え) */}
        <div className="backface-hidden rotate-y-180 absolute inset-0">
          <div className="h-full w-full rounded-card bg-raised shadow-raised">
            <div className="absolute left-4 right-4 top-4 border-b border-line pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">答え</span>
                <span className="text-xs text-disabled">クリックして表面へ</span>
              </div>
            </div>

            <div className="flex h-full items-center justify-center p-6 pt-16">
              <CardRenderer cardData={card} side="back" className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
