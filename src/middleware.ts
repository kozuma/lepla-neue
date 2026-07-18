import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase Auth のセッション更新 + 未ログインリダイレクト。
 * 環境変数が無いローカル開発では何もしない(開発ユーザーで動作)
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.next()

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname.startsWith('/login')

  if (!user && !isAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  // 学習者向け画面のみ対象。管理画面(/admin, /payload-api)と API(自前で401を返す)、
  // 静的アセットは除外
  matcher: [
    '/((?!api|admin|payload-api|_next/static|_next/image|favicon.ico|archetypes|.*\\.svg$).*)',
  ],
}
