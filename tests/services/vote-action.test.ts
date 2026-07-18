import { describe, expect, it } from 'vitest'

import { buildFootprints } from '@/services/narrative'
import { determineVoteAction, type VoteActionContext } from '@/services/voting'

const base: VoteActionContext = {
  streakAfterVote: 2,
  daysSinceLastVote: 1,
  isFirstTimeDeck: false,
  daysSinceDeckLastStudied: 1,
  sessionMinutes: 5,
  cardsStudied: 3,
  flippedCards: 2,
}

describe('determineVoteAction', () => {
  it('通常の学習は daily_study', () => {
    expect(determineVoteAction(base)).toBe('daily_study')
  })

  it('ストリークがちょうど7日に到達した初回投票で consistent_week', () => {
    expect(determineVoteAction({ ...base, streakAfterVote: 7, daysSinceLastVote: 1 })).toBe(
      'consistent_week',
    )
  })

  it('同日2回目(daysSinceLastVote=0)ではストリーク7でも consistent_week にならない', () => {
    expect(
      determineVoteAction({ ...base, streakAfterVote: 7, daysSinceLastVote: 0 }),
    ).not.toBe('consistent_week')
  })

  it('20分以上 + 全カード裏返しで deep_engagement', () => {
    expect(
      determineVoteAction({ ...base, sessionMinutes: 20, cardsStudied: 5, flippedCards: 5 }),
    ).toBe('deep_engagement')
  })

  it('20分以上でも裏返しが不足なら deep_engagement にならない', () => {
    expect(
      determineVoteAction({ ...base, sessionMinutes: 25, cardsStudied: 5, flippedCards: 3 }),
    ).toBe('daily_study')
  })

  it('3日以上の休息からの復帰は return_after_break', () => {
    expect(determineVoteAction({ ...base, daysSinceLastVote: 3, streakAfterVote: 1 })).toBe(
      'return_after_break',
    )
  })

  it('初めてのデッキは explore_new_topic', () => {
    expect(
      determineVoteAction({ ...base, isFirstTimeDeck: true, daysSinceDeckLastStudied: null }),
    ).toBe('explore_new_topic')
  })

  it('初投票(daysSinceLastVote=null)の初デッキは explore_new_topic', () => {
    expect(
      determineVoteAction({
        ...base,
        daysSinceLastVote: null,
        streakAfterVote: 1,
        isFirstTimeDeck: true,
        daysSinceDeckLastStudied: null,
      }),
    ).toBe('explore_new_topic')
  })

  it('7日以上あいだを置いたデッキは review_old_material', () => {
    expect(determineVoteAction({ ...base, daysSinceDeckLastStudied: 7 })).toBe(
      'review_old_material',
    )
  })

  it('優先順位: consistent_week は deep_engagement より優先', () => {
    expect(
      determineVoteAction({
        ...base,
        streakAfterVote: 7,
        daysSinceLastVote: 1,
        sessionMinutes: 30,
        cardsStudied: 5,
        flippedCards: 5,
      }),
    ).toBe('consistent_week')
  })
})

describe('buildFootprints', () => {
  it('日付と物語的ラベルのみを返す(数値を含まない)', () => {
    const footprints = buildFootprints([
      { action: 'explore_new_topic', createdAt: new Date('2026-07-18T10:00:00') },
      { action: 'daily_study', createdAt: new Date('2026-07-17T09:00:00') },
      { action: 'consistent_week', createdAt: new Date('2026-07-16T09:00:00') },
    ])
    expect(footprints).toEqual([
      { date: '7月18日', label: '新たな書物を開いた' },
      { date: '7月17日', label: '学びを重ねた' },
      { date: '7月16日', label: '七日の道を歩み通した' },
    ])
  })
})
