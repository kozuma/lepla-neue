import { z } from 'zod'

import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

/**
 * デッキ詳細(テンプレート込み)
 */
export async function GET(_request: Request, { params }: { params: Promise<{ deckId: string }> }) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { deckId } = await params
  const parsed = z.coerce.number().int().positive().safeParse(deckId)
  if (!parsed.success) return Response.json({ error: 'not_found' }, { status: 404 })

  const payload = await getPayloadClient()
  const deck = await payload
    .findByID({ collection: 'decks', id: parsed.data, depth: 1 })
    .catch(() => null)
  if (!deck || deck.status !== 'published')
    return Response.json({ error: 'not_found' }, { status: 404 })

  const template = typeof deck.cardTemplate === 'object' ? deck.cardTemplate : null
  return Response.json({
    id: deck.id,
    name: deck.name,
    description: deck.description ?? '',
    level: deck.level ?? 'easy',
    archetype:
      typeof deck.archetypeAlignment.primary === 'object'
        ? {
            slug: deck.archetypeAlignment.primary.slug,
            name: deck.archetypeAlignment.primary.name,
          }
        : null,
    template: template
      ? {
          content: template.content,
          variables: (template.variables ?? []).map((v) => ({
            name: v.name,
            isRequired: v.isRequired ?? false,
          })),
        }
      : null,
  })
}
