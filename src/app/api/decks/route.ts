import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

/**
 * デッキ一覧(published のみ)。コンテンツの読み取りなので Payload Local API を使う
 */
export async function GET() {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const payload = await getPayloadClient()
  const decks = await payload.find({
    collection: 'decks',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit: 100,
    sort: 'name',
  })

  return Response.json({
    decks: decks.docs.map((deck) => ({
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
    })),
  })
}
