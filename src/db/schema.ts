/**
 * Drizzle スキーマ — 動的データの単一の真実(開発憲法 §5、設計書 §7)
 *
 * コンテンツ(アーキタイプ定義・デッキ・カード等)は Payload 管轄(payload スキーマ)。
 * ここは学習セッション・投票・進捗の動的データのみ。
 *
 * 二層構造(憲法 §3-4): strength・集計キャッシュ・しきい値は内部データであり、
 * API レスポンス・UI に露出しない。露出してよいのは物語層(称号・詩的表現)のみ。
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const voteActionEnum = pgEnum('vote_action', [
  'daily_study',
  'deep_engagement',
  'return_after_break',
  'explore_new_topic',
  'review_old_material',
  'complete_deck',
  'consistent_week',
])

/**
 * 投票の一次記録(append-only)。集計はここから常に再計算可能
 */
export const identityVotes = pgTable(
  'identity_votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Supabase Auth のユーザーID(実配線は後続フェーズ)
    userId: uuid('user_id').notNull(),
    // Payload の Archetypes.slug を参照(スキーマをまたぐため FK は張らない)
    archetypeId: varchar('archetype_id', { length: 64 }).notNull(),
    action: voteActionEnum('action').notNull(),
    // 1.00〜2.00(設計書 §4.2)。内部データ
    strength: numeric('strength', { precision: 3, scale: 2 }).notNull(),
    // セッションの生メタデータ(deckId, cardsStudied, sessionDuration 等)。内部記録用
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // 集計の再計算・ストリーク算出用(ユーザー×アーキタイプの時系列走査)
    index('identity_votes_user_archetype_created_idx').on(
      table.userId,
      table.archetypeId,
      table.createdAt,
    ),
  ],
)

/**
 * ユーザー×アーキタイプの旅の状態。
 * 集計列は投票記録時に service が更新するキャッシュ(投票ログから再計算可能)
 */
export const userArchetypes = pgTable(
  'user_archetypes',
  {
    userId: uuid('user_id').notNull(),
    archetypeId: varchar('archetype_id', { length: 64 }).notNull(),
    isPrimary: boolean('is_primary').notNull().default(true),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    // 0〜2(設計書 §5.1)
    currentStage: smallint('current_stage').notNull().default(0),
    // --- 集計キャッシュ(内部用・API露出禁止) ---
    totalVotes: integer('total_votes').notNull().default(0),
    qualityAvg: numeric('quality_avg', { precision: 4, scale: 3 }).notNull().default('0'),
    activeDays: integer('active_days').notNull().default(0),
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.archetypeId] })],
)

/**
 * 学習セッション。完了時に投票が記録される(設計書 §4.3)
 */
export const studySessions = pgTable('study_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  // Payload の Decks.id を参照(FK は張らない)
  deckId: integer('deck_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  cardsStudied: integer('cards_studied').notNull().default(0),
  flippedCards: integer('flipped_cards').notNull().default(0),
})
