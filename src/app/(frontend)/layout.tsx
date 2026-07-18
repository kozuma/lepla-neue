import type { Metadata } from 'next'
import { Noto_Sans_JP, Noto_Serif_JP, Cormorant_Garamond } from 'next/font/google'
import React from 'react'
import './globals.css'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Providers } from './providers'

// 機能的レジスタ(本文)フォント → globals.css の --font-functional
const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

// 儀式的レジスタ(見出し・演出)フォント → globals.css の --font-ceremonial
const notoSerifJP = Noto_Serif_JP({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
})

// ラテン語小ラベル用フォント → globals.css の --font-latin-display
const cormorantGaramond = Cormorant_Garamond({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lepla - アイデンティティ変容を支援する学習プラットフォーム',
  description:
    '「Every action is a vote for the type of person you wish to become」- アイデンティティベースの習慣形成で、理想の自分へと変容する旅を始めましょう。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${notoSerifJP.variable} ${cormorantGaramond.variable}`}
    >
      <body className="min-h-screen bg-base text-primary">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
