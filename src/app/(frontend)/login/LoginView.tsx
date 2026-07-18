'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

// 認証画面(機能的レジスタ: 平易な日本語)
export function LoginView() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ローカル開発(Supabase 未設定)では認証不要
  if (!supabase) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
        <p className="mb-6 text-sm text-secondary">
          ローカル開発モードです。ログインは不要で、開発ユーザーとして動作しています。
        </p>
        <Button variant="secondary" onClick={() => router.push('/')}>
          ホームへ戻る
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('メールアドレスまたはパスワードが正しくありません。')
        setIsSubmitting(false)
        return
      }
      router.push('/')
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage('登録できませんでした。パスワードは8文字以上にしてください。')
      setIsSubmitting(false)
      return
    }
    setMessage('確認メールを送りました。メール内のリンクを開いてから、ログインしてください。')
    setMode('signin')
    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-24">
      <div className="mb-10 text-center">
        <p className="text-latin-label mb-4">Lepla</p>
        <h1 className="text-xl font-medium text-primary">
          {mode === 'signin' ? 'ログイン' : 'アカウント登録'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-secondary">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-4 py-3 text-sm text-primary outline-none transition-colors duration-quick focus:border-line-strong"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-secondary">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-4 py-3 text-sm text-primary outline-none transition-colors duration-quick focus:border-line-strong"
          />
        </div>

        {message && <p className="text-sm text-secondary">{message}</p>}

        <Button type="submit" variant="primary" size="large" className="w-full" disabled={isSubmitting}>
          {mode === 'signin' ? 'ログイン' : '登録する'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMessage(null)
          }}
          className="text-sm text-secondary underline decoration-line underline-offset-4 transition-colors duration-quick hover:text-primary"
        >
          {mode === 'signin' ? 'はじめての方はこちら' : 'ログインはこちら'}
        </button>
      </div>
    </div>
  )
}
