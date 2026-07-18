import Image from 'next/image'
import React from 'react'

// Phase 0 の仮ホーム。オンボーディング・ホーム画面は後続フェーズで旧リポジトリの
// 許可リスト(docs/salvage/FRONTEND_ASSETS.md)に沿って移植する
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <Image
        src="/archetypes/archetype-thinker.svg"
        alt=""
        width={160}
        height={256}
        priority
      />
      <div className="max-w-ceremonial text-center">
        <h1 className="font-ceremonial text-2xl tracking-widest">Lepla</h1>
        <p className="mt-6 font-ceremonial leading-loose text-secondary">
          日々の学びは、なりたい自分への一票。
        </p>
      </div>
    </div>
  )
}
