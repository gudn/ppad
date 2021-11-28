import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import sup from 'markdown-it-sup'
import sub from 'markdown-it-sub'
import deflist from 'markdown-it-deflist'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/contrib/mhchem'

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
  },
}

const codeRender = {
  wrap(render: any) {
    return function (...args: any[]) {
      return render.apply(this, args)
    }
  },
  inline(md: MarkdownIt, tokens: any, idx: number, options: any): string {
    const code = tokens[idx]
    const next = tokens[idx + 1]
    let lang = 'plaintext'

    if (next && next.type === 'text') {
      const match = /^{\.([^}]+)}/.exec(next.content)

      if (match) {
        lang = match[1]

        next.content = next.content.slice(match[0].length)
      }
    }


    switch (lang) {
      case 'latex':
        return latex.inline(code.content)
      case 'ce':
        return latex.inline(`\\ce{${code.content}}`)
      default:
        const highlighted = options.highlight(code.content, lang)
        const cls = lang
          ? ` class="hljs ${options.langPrefix}${md.utils.escapeHtml(lang)}"`
          : ' class="hljs"'

        return `<code${cls}>${highlighted}</code>`
    }
  },
  block(code: string, lang: string) {
    switch (lang) {
      case 'latex':
        return latex.display(code)
      case 'latex-source':
        try {
          return hljs.highlight(code, {
            language: 'latex',
            ignoreIllegals: true,
          }).value
        } catch (e) {
          return ''
        }
      case 'ce':
        return latex.display(`\\ce{${code}}`)
      default:
        try {
          return lang
            ? hljs.highlight(code, { language: lang, ignoreIllegals: true })
                .value
            : hljs.highlightAuto(code).value
        } catch (e) {
          return ''
        }
    }
  },
}

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  linkify: true,
  highlight: codeRender.block,
  typographer: true,
})

md.use(emoji)
md.use(sup)
md.use(sub)
md.use(deflist)

md.renderer.rules.fence = codeRender.wrap(md.renderer.rules.fence)
md.renderer.rules.code_block = codeRender.wrap(md.renderer.rules.code_block)
md.renderer.rules.code_inline = codeRender.inline.bind(null, md)

export default function render(s: string): string {
  return md.render(s)
}
