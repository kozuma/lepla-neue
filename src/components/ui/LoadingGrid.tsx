'use client'

import { cn } from '@/lib/utils'

interface LoadingGridProps {
  count?: number
  className?: string
}

export function LoadingGrid({ count = 6, className }: LoadingGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} />
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-card bg-surface p-6 shadow-card">
      {/* 画像エリア */}
      <div className="h-48 w-full rounded-md bg-line" />

      {/* タイトル */}
      <div className="h-6 w-3/4 rounded-sm bg-line" />

      {/* 説明文 */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-sm bg-line" />
        <div className="h-4 w-5/6 rounded-sm bg-line" />
      </div>

      {/* ボタンエリア */}
      <div className="h-10 w-full rounded-md bg-line" />
    </div>
  )
}
