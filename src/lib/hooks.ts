'use client'

/**
 * React Query フック(Route Handlers への同一オリジン fetch)。
 * queryKey 設計・invalidate 方針は旧 lib/api/hooks.ts の骨格を踏襲
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ArchetypeContent,
  DeckDetail,
  DeckSummary,
  JourneyResponse,
  SessionCompleteResponse,
  StudyCard,
} from '@/types/content'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json() as Promise<T>
}

export const queryKeys = {
  journey: ['journey'] as const,
  archetypes: ['archetypes'] as const,
  decks: ['decks'] as const,
  deck: (id: string | number) => ['decks', String(id)] as const,
  cards: (deckId: string | number) => ['decks', String(deckId), 'cards'] as const,
}

export function useJourney() {
  return useQuery({
    queryKey: queryKeys.journey,
    queryFn: () => fetchJson<JourneyResponse>('/api/me/journey'),
    staleTime: 30 * 1000,
  })
}

export function useArchetypes() {
  return useQuery({
    queryKey: queryKeys.archetypes,
    queryFn: () =>
      fetchJson<{ archetypes: ArchetypeContent[] }>('/api/archetypes').then((r) => r.archetypes),
    staleTime: 10 * 60 * 1000,
  })
}

export function useDecks() {
  return useQuery({
    queryKey: queryKeys.decks,
    queryFn: () => fetchJson<{ decks: DeckSummary[] }>('/api/decks').then((r) => r.decks),
    staleTime: 60 * 1000,
  })
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: queryKeys.deck(deckId),
    queryFn: () => fetchJson<DeckDetail>(`/api/decks/${deckId}`),
    staleTime: 60 * 1000,
  })
}

export function useCards(deckId: string) {
  return useQuery({
    queryKey: queryKeys.cards(deckId),
    queryFn: () =>
      fetchJson<{ cards: StudyCard[] }>(`/api/decks/${deckId}/cards`).then((r) => r.cards),
    staleTime: 60 * 1000,
  })
}

export function useSelectArchetype() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (archetype: string) =>
      fetchJson<{ ok: boolean }>('/api/me/archetype', {
        method: 'POST',
        body: JSON.stringify({ archetype }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.journey }),
  })
}

export function useStartSession() {
  return useMutation({
    mutationFn: (deckId: number) =>
      fetchJson<{ sessionId: string }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ deckId }),
      }),
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { sessionId: string; cardsStudied: number; flippedCards: number }) =>
      fetchJson<SessionCompleteResponse>(`/api/sessions/${input.sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          cardsStudied: input.cardsStudied,
          flippedCards: input.flippedCards,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.journey }),
  })
}
