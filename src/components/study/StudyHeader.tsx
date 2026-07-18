'use client'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'

interface StudyHeaderProps {
  deck: { name: string }
  currentCardIndex: number
  totalCards: number
  onExit: () => void
  className?: string
}

export function StudyHeader({ deck, currentCardIndex, totalCards, onExit, className }: StudyHeaderProps) {
  const [showExitModal, setShowExitModal] = useState(false)

  const handleExitConfirm = () => {
    setShowExitModal(false)
    onExit()
  }

  return (
    <>
      <header className={`flex items-center justify-between border-b border-line bg-base/95 p-4 ${className ?? ''}`}>
        {/* 左側: デッキ情報 */}
        <div>
          <h1 className="line-clamp-1 text-base font-medium text-primary">
            {deck.name}
          </h1>
          <p className="text-xs text-secondary">
            {currentCardIndex + 1} / {totalCards} 枚目
          </p>
        </div>

        {/* 右側: 操作ボタン */}
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowExitModal(true)}
        >
          <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          終了
        </Button>
      </header>

      {/* 退出確認モーダル */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="学習を終了しますか？"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-base text-primary">
            ここまで {currentCardIndex + 1} / {totalCards} 枚
          </p>
          <p className="text-sm text-secondary">
            学習を途中で終了しますか？進捗は保存されませんが、いつでも再開できます。
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowExitModal(false)}
            >
              続ける
            </Button>
            <Button
              variant="primary"
              onClick={handleExitConfirm}
            >
              終了する
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
