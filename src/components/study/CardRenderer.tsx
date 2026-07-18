'use client'

import { cn } from '@/lib/utils'
import { renderCardTemplate } from '@/services/template'
import type { StudyCard as Card } from '@/types/content'

interface CardRendererProps {
  cardData: Card
  side: 'front' | 'back'
  template?: { content: string } | null
  className?: string
}

export function CardRenderer({ cardData, side, template, className }: CardRendererProps) {
  const values = cardData.values ?? []

  if (values.length === 0) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center text-center', className)}>
        <p className="text-lg text-primary">カードの内容が見つかりません</p>
      </div>
    )
  }

  // 表面: 最初の変数(title)のみを大きく見せる
  if (side === 'front') {
    return (
      <div className={cn('flex h-full w-full items-center justify-center text-center', className)}>
        <div className="max-w-full space-y-4 px-4">
          <div className="text-lg font-medium leading-body text-primary">
            {values[0]?.value || 'カードの表面'}
          </div>
        </div>
      </div>
    )
  }

  // 裏面: テンプレートHTMLに値を埋めて描画(テンプレートは管理者管轄の信頼済みコンテンツ、
  // カード値は renderCardTemplate 内でエスケープ済み)
  if (template?.content) {
    return (
      <div
        className={cn('flex h-full w-full items-center justify-center overflow-auto text-center', className)}
      >
        <div
          className="max-w-full px-4 text-primary"
          dangerouslySetInnerHTML={{ __html: renderCardTemplate(template.content, values) }}
        />
      </div>
    )
  }

  // テンプレートが無い場合のフォールバック: 2番目以降の値を並べる
  const backContent = values.slice(1).map((v) => v.value).join('\n') || 'カードの裏面'
  return (
    <div className={cn('flex h-full w-full items-center justify-center text-center', className)}>
      <div className="max-w-full space-y-4 px-4">
        <div className="text-lg leading-body text-primary">
          {backContent.split('\n').map((line, index) => (
            <div key={index} className="mb-2">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
