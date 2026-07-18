'use client'

import { cn } from '@/lib/utils'

import type { StudyCard as Card } from '@/types/content'

interface CardRendererProps {
  cardData: Card
  side: 'front' | 'back'
  className?: string
}

export function CardRenderer({ cardData, side, className }: CardRendererProps) {
  // カードの値から表面・裏面のコンテンツを抽出
  const getCardContent = () => {
    if (!cardData.values || cardData.values.length === 0) {
      return {
        front: 'カードの内容が見つかりません',
        back: 'カードの内容が見つかりません'
      }
    }

    // 最初の変数(title)を表面、2番目以降を裏面として使用
    // TODO(Phase 3): テンプレートの content HTML を使った本レンダリング
    const values = cardData.values

    const frontContent = values[0]?.value || 'カードの表面'
    const backContent = values.slice(1).map(v => v.value).join('\n') || 'カードの裏面'

    return {
      front: frontContent,
      back: backContent
    }
  }

  const content = getCardContent()
  const currentContent = side === 'front' ? content.front : content.back

  return (
    <div className={cn('flex h-full w-full items-center justify-center text-center', className)}>
      <div className="max-w-full space-y-4 px-4">
        {side === 'front' ? (
          <div className="text-lg font-medium leading-body text-primary">
            {currentContent}
          </div>
        ) : (
          <div className="text-lg leading-body text-primary">
            {currentContent.split('\n').map((line, index) => (
              <div key={index} className="mb-2">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
