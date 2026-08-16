'use client'

import { usePathname } from 'next/navigation'

import { Footer } from './Footer'
import { Header } from './Header'

// 学習画面(/decks/[id]/study)は没入のため、グローバルの Header/Footer を隠す。
// それ以外のページでは通常どおり表示する。
const IMMERSIVE_ROUTE = /^\/decks\/[^/]+\/study\/?$/

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isImmersive = IMMERSIVE_ROUTE.test(pathname ?? '')

  return (
    <div className="flex min-h-screen flex-col">
      {!isImmersive && <Header />}
      <main className="flex flex-1 flex-col">{children}</main>
      {!isImmersive && <Footer />}
    </div>
  )
}
