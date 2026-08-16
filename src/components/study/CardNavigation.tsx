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
  className?: string
}

// 没入のため最小限: index/total 表示とラベルなしの左右ボタンのみ。
export function CardNavigation({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  className,
}: CardNavigationProps) {
  return (
    <div className={cn('flex items-center justify-center gap-6', className)}>
      {/* 前へ */}
      <Button
        variant="ghost"
        size="small"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="前のカード"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {/* 現在位置 */}
      <div className="min-w-[64px] text-center text-base font-medium text-secondary">
        {currentIndex + 1} / {totalCards}
      </div>

      {/* 次へ */}
      <Button
        variant="ghost"
        size="small"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="次のカード"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}
