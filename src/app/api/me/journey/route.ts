import { getPrimaryArchetype, getRecentVotes } from '@/db/journey'
import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { buildFootprints, buildJourneyNarrative } from '@/services/narrative'

/**
 * ホーム/プロフィール用。返すのは物語層のみ(設計書 §7)
 */
export async function GET() {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const journey = await getPrimaryArchetype(userId)
  if (!journey) return Response.json({ onboardingCompleted: false })

  const payload = await getPayloadClient()
  const archetype = (
    await payload.find({
      collection: 'archetypes',
      where: { slug: { equals: journey.archetypeId } },
    })
  ).docs[0]
  if (!archetype) return Response.json({ error: 'archetype_not_found' }, { status: 500 })

  const recentVotes = await getRecentVotes(userId, journey.archetypeId)
  const narrative = buildJourneyNarrative(
    {
      archetypeId: journey.archetypeId,
      currentStage: journey.currentStage,
      totalVotes: journey.totalVotes,
      currentStreak: journey.currentStreak,
      activeDays: journey.activeDays,
      startedAt: journey.startedAt,
    },
    archetype,
    new Date(),
  )
  return Response.json({
    onboardingCompleted: true,
    ...narrative,
    footprints: buildFootprints(recentVotes),
  })
}
