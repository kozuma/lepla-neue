'use client'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CardNavigationProps {
  currentIndex: number
  totalCards: number
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  isLastCard: boolean
  hasFlipped: boolean
  className?: string
}

export function CardNavigation({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isLastCard,
  hasFlipped,
  className
}: CardNavigationProps) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* 前へボタン */}
      <Button
        variant="secondary"
        size="medium"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="min-w-[120px]"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        前のカード
      </Button>

      {/* 現在位置表示 */}
      <div className="mx-6 min-w-[100px] text-center">
        <div className="text-base font-medium text-primary">
          {currentIndex + 1} / {totalCards}
        </div>
        <div className="text-xs text-secondary">
          {!hasFlipped && '表面を確認してから'}
        </div>
      </div>

      {/* 次へ／完了ボタン */}
      <Button
        variant="primary"
        size="medium"
        onClick={onNext}
        disabled={!canGoNext}
        className="min-w-[120px]"
      >
        {isLastCard ? (
          <>
            <span>学習完了</span>
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : (
          <>
            <span>次のカード</span>
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </Button>
    </div>
  )
}
