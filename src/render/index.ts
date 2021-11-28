import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import sup from 'markdown-it-sup'
import sub from 'markdown-it-sub'
import deflist from 'markdown-it-deflist'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/contrib/mhchem'

import custom from './custom'

const latex = {
  display(code: string): string {
    return katex.renderToString(code, {
      displayMode: true,
      output: 'html',
      throwOnError: false,
      errorColor: '#ff4444', // NOTE sync with $danger-color
    })
  },
  inline(code: string): string {
    return katex.renderToString(code, {
      displayMode: false,
      output: 'html',
      throwOnError: false,
      errorColor: '#ff4444', // NOTE sync with $danger-color
    })
  }
}

const highlighter = {
  wrap(render: any) {
    return function (...args: any[]) {
      return render
        .apply(this, args)
        .replace('<code class="', '<code class="hljs ')
        .replace('<code>', '<code class="hljs">')
    }
  },
  inlineCodeRenderer(
    md: MarkdownIt,
    tokens: any,
    idx: number,
    options: any,
  ): string {
    const code = tokens[idx]
    const next = tokens[idx + 1]
    let lang = 'plaintext'

    if (next && next.type === 'text') {
      // Match kramdown- or pandoc-style language specifier.
      // e.g. `code`{:.ruby} or `code`{.haskell}
      const match = /^{:?\.([^}]+)}/.exec(next.content)

      if (match) {
        lang = match[1]

        // Remove the language specification from text following the code.
        next.content = next.content.slice(match[0].length)
      }
    }

    const highlighted = options.highlight(code.content, lang)
    const cls = lang
      ? ` class="${options.langPrefix}${md.utils.escapeHtml(lang)}"`
      : ''

    return `<code${cls}>${highlighted}</code>`
  },
  highlight(code: string, lang: string) {
    try {
      return lang
        ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
        : hljs.highlightAuto(code).value
    } catch (e) {
      return ''
    }
  },
}

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  linkify: true,
  highlight: highlighter.highlight,
  typographer: true,
})

md.use(emoji)
md.use(sup)
md.use(sub)
md.use(deflist)
md.use(custom, {
  video(url: string) {
    return `<video controls>
        <source src="${url}">
      </video>`
  },
  latex(code: string) {
    return latex.display(code)
  },
  latexi(code: string) {
    return latex.inline(code)
  },
  ce(code: string) {
    return latex.display(`\\ce{${code}}`)
  },
  cei(code: string) {
    return latex.inline(`\\ce{${code}}`)
  },
})

md.renderer.rules.fence = highlighter.wrap(md.renderer.rules.fence)
md.renderer.rules.code_block = highlighter.wrap(md.renderer.rules.code_block)
md.renderer.rules.code_inline = highlighter.wrap(
  highlighter.inlineCodeRenderer.bind(null, md),
)

export default function render(s: string): string {
  return md.render(s)
}
