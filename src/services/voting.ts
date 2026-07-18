/**
 * 投票強度の計算 — 純粋関数のみ(開発憲法 §5)
 * 旧リポジトリ lib/archetypes/vote-calculator.ts からの移植(lib版が正典)。
 * しきい値・係数は二層構造の内部データであり、APIレスポンス・UIに露出しないこと(憲法 §3-4)。
 */
import type { VoteAction, VoteStrengthParams } from '@/types/vote'

/**
 * 数値を詩的な表現に変換(ゲーミフィケーションを避ける)
 */
export function formatPoeticNumber(
  value: number,
  type: 'votes' | 'streak' | 'days' = 'votes',
): string {
  if (type === 'votes') {
    if (value === 0) return '始まりの時'
    if (value < 10) return '僅かな歩み'
    if (value < 30) return '着実な歩み'
    if (value < 50) return '確かな歩み'
    if (value < 100) return '深き歩み'
    if (value < 200) return '豊かな歩み'
    return '偉大なる歩み'
  }

  if (type === 'streak') {
    if (value === 0) return '新たな始まり'
    if (value === 1) return '第一歩'
    if (value < 7) return `${value}日の道程`
    if (value < 14) return '一週の継続'
    if (value < 30) return '二週の継続'
    if (value < 60) return '一月の継続'
    if (value < 100) return '二月の継続'
    return '永き継続'
  }

  if (type === 'days') {
    if (value === 0) return '今日より'
    if (value === 1) return '昨日より'
    if (value < 7) return `${value}日前より`
    if (value < 30) return '数週前より'
    if (value < 90) return '数月前より'
    return '遠き日より'
  }

  return String(value)
}

/**
 * 投票強度を計算(Phase 1: シンプル版)
 * 1〜2の範囲で投票の質を評価
 */
export function calculateVoteStrength(params: VoteStrengthParams): number {
  const { sessionDuration, cardsStudied, averageCardTime, flippedCards, isConsecutiveDay } = params

  let baseStrength = 1

  // セッション時間による加算(10分以上で質が高い)
  if (sessionDuration >= 10) {
    baseStrength += 0.3
  }

  // カード学習数による加算(5枚以上で質が高い)
  if (cardsStudied >= 5) {
    baseStrength += 0.2
  }

  // 平均カード時間による加算(じっくり読んでいる)
  if (averageCardTime >= 30) {
    baseStrength += 0.2
  }

  // 裏返し率による加算(積極的に学習している)
  const flipRate = cardsStudied > 0 ? flippedCards / cardsStudied : 0
  if (flipRate >= 0.5) {
    baseStrength += 0.2
  }

  // 連続日による加算
  if (isConsecutiveDay) {
    baseStrength += 0.1
  }

  // 最大値を2に制限
  return Math.min(2, baseStrength)
}

/**
 * 投票アクションの自動判定に使う文脈(サーバーが投票ログ・セッション履歴から導出する)
 */
export interface VoteActionContext {
  /** 今回の投票を含めた現在のストリーク(日) */
  streakAfterVote: number
  /** 直前の投票からの経過日数(日単位)。初投票なら null */
  daysSinceLastVote: number | null
  /** このデッキを学ぶのが初めてか */
  isFirstTimeDeck: boolean
  /** このデッキを最後に学んでからの経過日数。初回なら null */
  daysSinceDeckLastStudied: number | null
  /** セッション時間(分) */
  sessionMinutes: number
  cardsStudied: number
  flippedCards: number
}

/**
 * 投票アクションを文脈から判定する(設計書 §4.1)。
 * 発火条件はすべて内部秘匿。優先順位は上から先勝ち
 */
export function determineVoteAction(ctx: VoteActionContext): VoteAction {
  // ストリークがちょうど7日に到達した瞬間(今日の初投票で6→7になったとき)
  if (ctx.streakAfterVote === 7 && ctx.daysSinceLastVote === 1) {
    return 'consistent_week'
  }
  // 20分以上かけ、全カードを裏返した深い学習
  if (ctx.sessionMinutes >= 20 && ctx.cardsStudied > 0 && ctx.flippedCards >= ctx.cardsStudied) {
    return 'deep_engagement'
  }
  // 3日以上の休息からの復帰
  if (ctx.daysSinceLastVote !== null && ctx.daysSinceLastVote >= 3) {
    return 'return_after_break'
  }
  // 初めてのデッキ
  if (ctx.isFirstTimeDeck) {
    return 'explore_new_topic'
  }
  // 7日以上あいだを置いたデッキの学び直し
  if (ctx.daysSinceDeckLastStudied !== null && ctx.daysSinceDeckLastStudied >= 7) {
    return 'review_old_material'
  }
  return 'daily_study'
}

/**
 * アクションタイプに基づく投票強度の調整
 */
export function adjustStrengthByAction(baseStrength: number, action: VoteAction): number {
  switch (action) {
    case 'daily_study':
      return baseStrength // そのまま

    case 'deep_engagement':
      return Math.min(2, baseStrength * 1.2) // 深い関与は20%ボーナス

    case 'return_after_break':
      return Math.min(2, baseStrength * 1.1) // 復帰は10%ボーナス

    case 'explore_new_topic':
      return Math.min(2, baseStrength * 1.15) // 新規探索は15%ボーナス

    case 'review_old_material':
      return baseStrength // 復習はそのまま

    case 'complete_deck':
      return 2 // デッキ完了は常に最高値

    case 'consistent_week':
      return 2 // 1週間継続も最高値

    default:
      return baseStrength
  }
}
