'use client'

import Link from 'next/link'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import type { DeckSummary } from '@/types/content'

interface DeckCardProps {
  deck: DeckSummary
  selectedArchetype?: string | null
}

export function DeckCard({ deck, selectedArchetype }: DeckCardProps) {
  // 親和性は archetypeAlignment の一致で判定し、数値でなく言葉で示す(設計書 §3.4)
  const matchesPath = Boolean(selectedArchetype && deck.archetype?.slug === selectedArchetype)

  return (
    <Link href={`/decks/${deck.id}`} className="block">
      <Card size="small" className="h-full p-0">
        <CardHeader className="p-0">
          <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-t-card bg-base">
            <span className="text-latin-label">Lepla</span>
            {matchesPath && deck.archetype && (
              <div className="absolute right-2 top-2">
                <span className="rounded-full border border-line bg-surface/90 px-2.5 py-1 text-xs text-secondary">
                  {deck.archetype.name}の道に合う
                </span>
              </div>
            )}
          </div>

          <div className="p-4 pb-2">
            <CardTitle className="line-clamp-2 text-base">{deck.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-2">
          <CardDescription className="line-clamp-3">{deck.description}</CardDescription>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-2">
          <span className="text-sm text-secondary transition-colors duration-quick hover:text-primary">
            詳しく見る →
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
