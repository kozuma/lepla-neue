/**
 * 投票(学習行動の記録)
 * 旧リポジトリ types/vote.ts からの移植(FRONTEND_ASSETS.md 持ち出し許可リスト)
 */
export interface IdentityVote {
  id: string
  userId: string
  archetypeId: string // どのアーキタイプへの投票か
  action: VoteAction // どんな行動か
  timestamp: Date
  strength: number // 1〜2(投票の質)

  // メタデータ
  metadata: {
    deckId?: string
    cardsStudied?: number
    sessionDuration?: number
    averageCardTime?: number
    flippedCards?: number
    bookmarked?: number
  }
}

/**
 * 投票アクション
 */
export type VoteAction =
  | 'daily_study' // 毎日の学習
  | 'deep_engagement' // 深い関与
  | 'return_after_break' // 中断後の再開
  | 'explore_new_topic' // 新しいトピック
  | 'review_old_material' // 復習
  | 'complete_deck' // デッキ完了
  | 'consistent_week' // 1週間継続

/**
 * 投票強度計算のためのパラメータ
 */
export interface VoteStrengthParams {
  sessionDuration: number // セッション時間(分)
  cardsStudied: number // 学習したカード数
  averageCardTime: number // カード平均時間(秒)
  flippedCards: number // 裏返したカード数
  isConsecutiveDay: boolean // 連続日かどうか
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
}
