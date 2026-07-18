/**
 * カードテンプレートの展開 — 純粋関数のみ(開発憲法 §5)。
 * テンプレート content({{variable}} プレースホルダ入りHTML)にカードの値を埋め込む。
 * テンプレートHTMLは管理者(Payload)管轄の信頼済みコンテンツだが、
 * カードの値はエスケープして埋め込む(値経由のHTML注入を防ぐ)
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch)
}

/**
 * {{variable}} をカードの値で置換する。値が無い変数は空文字になる
 */
export function renderCardTemplate(
  content: string,
  values: { variable: string; value: string }[],
): string {
  const map = new Map(values.map((v) => [v.variable, v.value]))
  return content.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_match, name: string) =>
    escapeHtml(map.get(name) ?? ''),
  )
}
