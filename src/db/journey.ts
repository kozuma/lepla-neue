/**
 * 旅(アーキタイプ進捗)の DB オーケストレーション層。
 * Route Handler から呼ばれ、純粋関数(services/)と DB を繋ぐ。
 * 計算ロジックはここに書かず、services/ に置いてテストする(憲法 §5)。
 */
import { and, desc, eq, isNotNull } from 'drizzle-orm'

import { db } from '@/db'
import { identityVotes, studySessions, userArchetypes } from '@/db/schema'
import { calculateGrowthProgress, deriveVoteParams, summarizeVotes } from '@/services/session'
import {
  adjustStrengthByAction,
  calculateVoteStrength,
  determineVoteAction,
} from '@/services/voting'

export async function getPrimaryArchetype(userId: string) {
  const rows = await db
    .select()
    .from(userArchetypes)
    .where(and(eq(userArchetypes.userId, userId), eq(userArchetypes.isPrimary, true)))
    .limit(1)
  return rows[0] ?? null
}

/**
 * アーキタイプを選ぶ(オンボーディング/変更)。
 * 同じスラッグの再選択は no-op。変更時は新しい旅として進捗0から始める(設計書 §8.1)。
 * 過去の投票ログは append-only のまま残す(一次データは消さない)
 */
export async function selectArchetype(userId: string, archetypeSlug: string) {
  const current = await getPrimaryArchetype(userId)
  if (current?.archetypeId === archetypeSlug) return current

  return db.transaction(async (tx) => {
    if (current) {
      await tx
        .update(userArchetypes)
        .set({ isPrimary: false })
        .where(
          and(
            eq(userArchetypes.userId, userId),
            eq(userArchetypes.archetypeId, current.archetypeId),
          ),
        )
    }
    // 過去に同じアーキタイプを歩んでいた場合も、新しい旅として初期化する
    await tx
      .delete(userArchetypes)
      .where(
        and(eq(userArchetypes.userId, userId), eq(userArchetypes.archetypeId, archetypeSlug)),
      )
    const [row] = await tx
      .insert(userArchetypes)
      .values({ userId, archetypeId: archetypeSlug, isPrimary: true })
      .returning()
    return row!
  })
}

export async function startSession(userId: string, deckId: number) {
  const [row] = await db.insert(studySessions).values({ userId, deckId }).returning()
  return row!
}

export type CompleteSessionResult =
  | { ok: false; reason: 'session_not_found' | 'already_completed' | 'no_archetype' }
  | {
      ok: true
      archetypeId: string
      previousStage: number
      newStage: number
      advanced: boolean
      summary: {
        totalVotes: number
        activeDays: number
        currentStreak: number
      }
    }

/**
 * セッション完了 → 投票記録・集計更新・昇格判定(設計書 §4.3, §5)。
 * strength は生メタデータからサーバーで計算する。1回の判定で1段のみ昇格。
 */
export async function completeSession(
  userId: string,
  sessionId: string,
  input: { cardsStudied: number; flippedCards: number },
  now: Date,
): Promise<CompleteSessionResult> {
  const [session] = await db
    .select()
    .from(studySessions)
    .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)))
    .limit(1)
  if (!session) return { ok: false, reason: 'session_not_found' }
  if (session.endedAt) return { ok: false, reason: 'already_completed' }

  const journey = await getPrimaryArchetype(userId)
  if (!journey) return { ok: false, reason: 'no_archetype' }

  const votes = await db
    .select({ strength: identityVotes.strength, createdAt: identityVotes.createdAt })
    .from(identityVotes)
    .where(
      and(eq(identityVotes.userId, userId), eq(identityVotes.archetypeId, journey.archetypeId)),
    )
  const voteRecords = votes.map((v) => ({ strength: Number(v.strength), createdAt: v.createdAt }))

  // 連続日判定: 昨日の投票があるか(日単位)
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const isConsecutiveDay = voteRecords.some((v) => {
    const d = v.createdAt
    return (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    )
  })

  const params = deriveVoteParams(
    {
      startedAt: session.startedAt,
      endedAt: now,
      cardsStudied: input.cardsStudied,
      flippedCards: input.flippedCards,
    },
    isConsecutiveDay,
  )

  // アクション判定の文脈: 直前の投票日・このデッキの学習履歴(設計書 §4.1)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const lastVoteAt = voteRecords.reduce<Date | null>(
    (latest, v) => (!latest || v.createdAt > latest ? v.createdAt : latest),
    null,
  )
  const priorDeckSessions = await db
    .select({ endedAt: studySessions.endedAt })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.deckId, session.deckId),
        isNotNull(studySessions.endedAt),
      ),
    )
  const deckLastStudiedAt = priorDeckSessions.reduce<Date | null>(
    (latest, s) => (s.endedAt && (!latest || s.endedAt > latest) ? s.endedAt : latest),
    null,
  )

  const preliminarySummary = summarizeVotes(
    [...voteRecords, { strength: 1, createdAt: now }],
    now,
  )
  const action = determineVoteAction({
    streakAfterVote: preliminarySummary.currentStreak,
    daysSinceLastVote: lastVoteAt
      ? Math.round((startOfDay(now) - startOfDay(lastVoteAt)) / dayMs)
      : null,
    isFirstTimeDeck: priorDeckSessions.length === 0,
    daysSinceDeckLastStudied: deckLastStudiedAt
      ? Math.round((startOfDay(now) - startOfDay(deckLastStudiedAt)) / dayMs)
      : null,
    sessionMinutes: params.sessionDuration,
    cardsStudied: input.cardsStudied,
    flippedCards: input.flippedCards,
  })
  const strength = adjustStrengthByAction(calculateVoteStrength(params), action)

  const allVotes = [...voteRecords, { strength, createdAt: now }]
  const summary = summarizeVotes(allVotes, now)
  const growth = calculateGrowthProgress(
    summary.totalVotes,
    summary.qualityAvg,
    summary.activeDays,
    journey.currentStage,
  )
  const newStage = growth.canAdvance ? journey.currentStage + 1 : journey.currentStage

  await db.transaction(async (tx) => {
    await tx
      .update(studySessions)
      .set({
        endedAt: now,
        cardsStudied: input.cardsStudied,
        flippedCards: input.flippedCards,
      })
      .where(eq(studySessions.id, sessionId))
    await tx.insert(identityVotes).values({
      userId,
      archetypeId: journey.archetypeId,
      action,
      strength: strength.toFixed(2),
      metadata: {
        deckId: session.deckId,
        cardsStudied: input.cardsStudied,
        sessionDuration: Math.round(params.sessionDuration * 60),
        averageCardTime: Math.round(params.averageCardTime),
        flippedCards: input.flippedCards,
      },
      createdAt: now,
    })
    await tx
      .update(userArchetypes)
      .set({
        currentStage: newStage,
        totalVotes: summary.totalVotes,
        qualityAvg: summary.qualityAvg.toFixed(3),
        activeDays: summary.activeDays,
        currentStreak: summary.currentStreak,
        longestStreak: summary.longestStreak,
      })
      .where(
        and(
          eq(userArchetypes.userId, userId),
          eq(userArchetypes.archetypeId, journey.archetypeId),
        ),
      )
  })

  return {
    ok: true,
    archetypeId: journey.archetypeId,
    previousStage: journey.currentStage,
    newStage,
    advanced: newStage > journey.currentStage,
    summary: {
      totalVotes: summary.totalVotes,
      activeDays: summary.activeDays,
      currentStreak: summary.currentStreak,
    },
  }
}

/**
 * 最近の足あと(直近の投票の action と日時)。露出は物語層(日付+言葉)に限る
 */
export async function getRecentVotes(userId: string, archetypeId: string, limit = 10) {
  return db
    .select({ action: identityVotes.action, createdAt: identityVotes.createdAt })
    .from(identityVotes)
    .where(and(eq(identityVotes.userId, userId), eq(identityVotes.archetypeId, archetypeId)))
    .orderBy(desc(identityVotes.createdAt))
    .limit(limit)
}
