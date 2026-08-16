'use client'

import { CardRenderer } from './CardRenderer'
import { cn } from '@/lib/utils'

import type { StudyCard as Card } from '@/types/content'

interface CardFaceProps {
  card: Card
  template?: { content: string } | null
  isFlipped: boolean
  onClick: () => void
  isAnimating: boolean
  className?: string
}

export function CardFace({ card, template, isFlipped, onClick, isAnimating, className }: CardFaceProps) {
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
          <div className="flex h-full w-full items-center justify-center rounded-card bg-surface p-6 shadow-card">
            <CardRenderer cardData={card} template={template} side="front" className="h-full w-full" />
          </div>
        </div>

        {/* カード裏面(答え) */}
        <div className="backface-hidden rotate-y-180 absolute inset-0">
          <div className="flex h-full w-full items-center justify-center rounded-card bg-raised p-6 shadow-raised">
            <CardRenderer cardData={card} template={template} side="back" className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
