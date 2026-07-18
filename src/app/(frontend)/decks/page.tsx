import { DecksListView } from './DecksListView'

export default function DecksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24">
      <div className="mb-8 pt-12">
        <h1 className="mb-3 text-2xl font-medium text-primary">学びの書庫</h1>
        <p className="text-sm text-secondary">今日の一歩となる教材を選びましょう。</p>
      </div>
      <DecksListView />
    </div>
  )
}
