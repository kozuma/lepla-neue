'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { useArchetypes, useSelectArchetype } from '@/lib/hooks'

export function ConfirmationView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const { data: archetypes, isLoading } = useArchetypes()
  const selectArchetype = useSelectArchetype()
  const [isConfirming, setIsConfirming] = useState(false)

  const archetypeSlug = searchParams.get('archetype')
  const archetype = archetypes?.find((a) => a.slug === archetypeSlug) ?? null

  useEffect(() => {
    if (!isLoading && archetypes && !archetype) {
      router.push('/onboarding/archetype-select')
    }
  }, [isLoading, archetypes, archetype, router])

  if (isLoading || !archetype) {
    return null
  }

  const handleConfirm = async () => {
    if (isConfirming) return

    setIsConfirming(true)

    // サーバーに選択を記録し、儀式的な静止を挟む
    await Promise.all([
      selectArchetype.mutateAsync(archetype.slug),
      new Promise((resolve) => setTimeout(resolve, prefersReducedMotion ? 0 : 2000)),
    ])

    router.push('/')
  }

  const handleGoBack = () => {
    router.push('/onboarding/archetype-select')
  }

  return (
    <motion.div
      className="flex flex-col items-center py-24"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
        <p className="text-latin-label mb-12">{archetype.nameEn}</p>

        <Image
          src={archetype.artwork}
          alt={`${archetype.name}のカード`}
          width={320}
          height={512}
          priority
          className={
            isConfirming
              ? 'mx-auto mb-10 h-auto w-48 rounded-card shadow-glow-gold transition-shadow duration-ceremonial'
              : 'mx-auto mb-10 h-auto w-48 rounded-card shadow-card'
          }
        />

        <h1 className="text-ceremonial text-2xl text-primary mb-1">{archetype.name}</h1>
        <p className="text-ceremonial text-sm text-secondary mb-10">{archetype.subtitle}</p>

        <p className="text-ceremonial mb-16 text-sm text-secondary">
          汝は{archetype.name}の道を選びし。
          <br />
          この選択が、明日の汝をかたちづくる。
        </p>

        {isConfirming ? (
          <p className="text-ceremonial text-sm text-primary" aria-live="polite">
            運命が刻まれている…
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
            >
              この道を歩み始める
            </button>
            <Button variant="ghost" size="small" onClick={handleGoBack}>
              選び直す
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
