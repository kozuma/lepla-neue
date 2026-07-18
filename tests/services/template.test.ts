import { describe, expect, it } from 'vitest'

import { escapeHtml, renderCardTemplate } from '@/services/template'

describe('renderCardTemplate', () => {
  const values = [
    { variable: 'title', value: 'contemplate' },
    { variable: 'meaning', value: '熟考する' },
  ]

  it('プレースホルダを値で置換する', () => {
    const html = renderCardTemplate('<p>{{title}}</p><p>{{meaning}}</p>', values)
    expect(html).toBe('<p>contemplate</p><p>熟考する</p>')
  })

  it('空白入りプレースホルダも置換する', () => {
    expect(renderCardTemplate('<p>{{ title }}</p>', values)).toBe('<p>contemplate</p>')
  })

  it('値が無い変数は空文字になる', () => {
    expect(renderCardTemplate('<p>{{unknown}}</p>', values)).toBe('<p></p>')
  })

  it('値のHTMLはエスケープされる(テンプレート側のタグは保持)', () => {
    const html = renderCardTemplate('<div>{{title}}</div>', [
      { variable: 'title', value: '<script>alert(1)</script>' },
    ])
    expect(html).toBe('<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>')
  })
})

describe('escapeHtml', () => {
  it('特殊文字をすべてエスケープする', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    )
  })
})
