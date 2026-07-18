'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'ホーム' },
  { href: '/decks', label: 'デッキ' },
  { href: '/profile', label: '旅の記録' },
]

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-base/95 px-6 py-4 sm:px-12">
        <Link href="/" className="font-latin text-xl tracking-wide text-primary">
          L<span className="text-accent">·</span> Lepla
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'text-xs tracking-wide transition-colors duration-quick',
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-secondary hover:text-primary'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-secondary transition-colors duration-quick hover:text-primary md:hidden"
          aria-label="メニューを開く"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-base p-6">
          <div className="mb-12 flex items-center justify-between">
            <span className="font-latin text-xl tracking-wide text-primary">
              L<span className="text-accent">·</span> Lepla
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-secondary transition-colors duration-quick hover:text-primary"
              aria-label="メニューを閉じる"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block text-lg tracking-wide transition-colors duration-quick',
                    isActive(item.href)
                      ? 'font-medium text-primary'
                      : 'text-secondary hover:text-primary'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
