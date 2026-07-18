/**
 * 学習者側の認証(Supabase Auth)。
 * ローカル開発はクラウド依存ゼロ(憲法 §6): Supabase の環境変数が無いときは
 * 固定の開発ユーザーで動作する。本番では必ず環境変数を設定する。
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 開発スタブ用の固定ユーザーID(uuid)。DBの user_id と型を揃える
const DEV_USER_ID = '00000000-0000-4000-8000-000000000001'

const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/**
 * リクエストの認証ユーザーIDを返す。未認証は null。
 * Route Handler の1行目で呼ぶ(4行構成の「認証チェック」)。
 */
export async function getUserId(): Promise<string | null> {
  if (!supabaseConfigured()) {
    // ローカル開発スタブ。本番ビルドでは環境変数未設定を許さない
    if (process.env.NODE_ENV === 'production') return null
    return process.env.DEV_USER_ID || DEV_USER_ID
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Route Handler では読み取りのみ(セッション更新は middleware の責務)
        },
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}
