'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface StudyExitButtonProps {
  currentCardIndex: number
  totalCards: number
  onExit: () => void
}

// 没入を保つための極小の離脱導線。画面隅に配置したラベルなしの × のみ。
// 誤操作で進捗を失わないよう、確認モーダルは残す。
export function StudyExitButton({ currentCardIndex, totalCards, onExit }: StudyExitButtonProps) {
  const [showExitModal, setShowExitModal] = useState(false)

  const handleExitConfirm = () => {
    setShowExitModal(false)
    onExit()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowExitModal(true)}
        aria-label="学習を終了"
        className="absolute right-4 top-4 z-10 text-disabled transition-colors duration-calm ease-standard hover:text-secondary focus:outline-none"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

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
            <Button variant="secondary" onClick={() => setShowExitModal(false)}>
              続ける
            </Button>
            <Button variant="primary" onClick={handleExitConfirm}>
              終了する
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
