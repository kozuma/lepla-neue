'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * ブラウザ側の Supabase クライアント。
 * 環境変数が無いローカル開発では null(認証UIは非表示、APIは開発ユーザーで動作)
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createBrowserClient(url, key)
}

export const isSupabaseEnabled = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
