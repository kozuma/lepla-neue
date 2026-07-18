'use client'

import { DeckCard } from '@/components/deck/DeckCard'
import { Button } from '@/components/ui/Button'
import { LoadingGrid } from '@/components/ui/LoadingGrid'
import { useDecks, useJourney } from '@/lib/hooks'

export function DecksListView() {
  const { data: decks, isLoading, isError } = useDecks()
  const { data: journey } = useJourney()

  const selectedArchetype = journey?.archetype?.slug ?? null

  if (isLoading) {
    return <LoadingGrid />
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-secondary">書庫を読み込めませんでした。</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          再読み込み
        </Button>
      </div>
    )
  }

  if (!decks || decks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-sm text-primary">書物は準備中です</p>
        <p className="text-sm text-secondary">まもなく様々な教材が追加されます。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {journey?.archetype && (
        <div className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="text-base font-medium text-primary">
            {journey.archetype.name}に適した書物
          </h2>
          <p className="text-sm text-secondary">あなたの道に合った教材を選べます。</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} selectedArchetype={selectedArchetype} />
        ))}
      </div>
    </div>
  )
}
