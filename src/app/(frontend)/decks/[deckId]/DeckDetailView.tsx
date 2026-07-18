'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useDeck, useJourney } from '@/lib/hooks'

interface DeckDetailViewProps {
  deckId: string
}

export function DeckDetailView({ deckId }: DeckDetailViewProps) {
  const { data: deck, isLoading, error } = useDeck(deckId)
  const { data: journey } = useJourney()

  if (isLoading) {
    return <DeckDetailSkeleton />
  }

  if (error || !deck) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-secondary">書物が見つかりませんでした。</p>
        <Link href="/decks">
          <Button variant="secondary">書庫に戻る</Button>
        </Link>
      </div>
    )
  }

  // 親和性は archetypeAlignment の一致で判定し、数値でなく言葉で示す(設計書 §3.4)
  const selectedArchetype = journey?.archetype ?? null
  const matchesPath = Boolean(
    selectedArchetype && deck.archetype?.slug === selectedArchetype.slug,
  )
  const affinityLabel = matchesPath
    ? 'あなたの道によく合う教材です'
    : '幅広い道に開かれた教材です'

  return (
    <div className="space-y-8">
      {/* パンくず */}
      <div className="flex items-center gap-3 text-sm text-secondary">
        <Link href="/decks" className="transition-colors duration-quick hover:text-primary">
          学びの書庫
        </Link>
        <span aria-hidden>›</span>
        <span>{deck.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 左側: デッキ詳細 */}
        <div className="space-y-6 lg:col-span-2">
          <Card variant={matchesPath ? 'mystical' : 'default'} className="p-0">
            <CardContent className="p-0">
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-t-card bg-base">
                <span className="text-latin-label">Lepla</span>
                {matchesPath && deck.archetype && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs text-secondary">
                      {deck.archetype.name}の道に合う
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="mb-4 text-2xl font-medium text-primary">{deck.name}</h1>
                <p className="text-base leading-body text-primary">{deck.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側: アクションカード */}
        <div className="space-y-6">
          <Card variant={matchesPath ? 'mystical' : 'default'}>
            <CardHeader>
              <CardTitle>学習を始める</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-secondary">この書物で今日の学びを始めましょう。</p>
                <Link href={`/decks/${deck.id}/study`} className="block">
                  <Button variant="primary" size="large" className="w-full">
                    学習を始める
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {selectedArchetype && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selectedArchetype.name}の道</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-secondary">{selectedArchetype.subtitle}</p>
                  <p className="text-sm text-primary">{affinityLabel}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function DeckDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-5 w-20 rounded-sm bg-line" />
        <span className="text-secondary" aria-hidden>
          ›
        </span>
        <div className="h-5 w-32 rounded-sm bg-line" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-0">
            <CardContent className="p-0">
              <div className="h-40 rounded-t-card bg-line" />
              <div className="space-y-4 p-6">
                <div className="h-8 w-3/4 rounded-sm bg-line" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-sm bg-line" />
                  <div className="h-4 w-5/6 rounded-sm bg-line" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 w-2/3 rounded-sm bg-line" />
                <div className="h-4 w-full rounded-sm bg-line" />
                <div className="h-12 w-full rounded-md bg-line" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
