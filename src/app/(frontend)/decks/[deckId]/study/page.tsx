import { StudyView } from './StudyView'

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  return <StudyView deckId={deckId} />
}
