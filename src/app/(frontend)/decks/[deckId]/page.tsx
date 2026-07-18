import { DeckDetailView } from './DeckDetailView'

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12">
      <DeckDetailView deckId={deckId} />
    </div>
  )
}
