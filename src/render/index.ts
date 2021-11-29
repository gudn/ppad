import MarkdownIt from 'markdown-it'
import { escapeHtml, unescapeAll } from 'markdown-it/lib/common/utils'
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
  inline(md: MarkdownIt, tokens: any, idx: number, options: any): string {
    const code = tokens[idx]
    const next = tokens[idx + 1]
    let lang = 'plaintext'

    if (next && next.type === 'text') {
      const match = /^\.([\w-]+)/.exec(next.content)

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
      case 'latex-source':
        lang = 'latex'
      default:
        const highlighted = options.highlight(code.content, lang)
        const cls = lang
          ? ` class="hljs ${options.langPrefix}${md.utils.escapeHtml(lang)}"`
          : ' class="hljs"'

        return `<code${cls}>${highlighted}</code>`
    }
  },
  block(code: string, lang: string, _attrs: any) {
    switch (lang) {
      case 'latex':
        return latex.display(code)
      case 'ce':
        return latex.display(`\\ce{${code}}`)
      case 'latex-source':
        lang = 'latex'
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

md.renderer.rules.code_block = function (
  tokens: any[],
  idx: number,
  _options: any,
  _env: any,
  self: any,
) {
  const token = tokens[idx]
  console.log(tokens)
  return (
    '<pre' +
    self.renderAttrs(token) +
    '><code>' +
    escapeHtml(tokens[idx].content) +
    '</code></pre>\n'
  )
}
md.renderer.rules.code_inline = codeRender.inline.bind(null, md)
md.renderer.rules.code_block = (
  tokens: any[],
  idx: number,
  _opts: any,
  _env: any,
  self: any,
) => {
  const token = tokens[idx]

  return (
    '<pre' +
    self.renderAttrs(token) +
    '><code class="hljs">' +
    escapeHtml(tokens[idx].content) +
    '</code></pre>\n'
  )
}
md.renderer.rules.fence = (
  tokens: any[],
  idx: number,
  _opts: any,
  _env: any,
  self: any,
) => {
  const token = tokens[idx],
    info = token.info ? unescapeAll(token.info).trim() : ''
  let langName = '',
    langAttrs = ''

  if (info) {
    let arr = info.split(/(\s+)/g)
    langName = arr[0]
    langAttrs = arr.slice(2).join('')
  }

  const highlighted =
    codeRender.block(token.content, langName, langAttrs) ||
    escapeHtml(token.content)

  if (highlighted.indexOf('<pre') === 0) {
    return highlighted + '\n'
  }

  let result = ''

  // If language exists, inject class gently, without modifying original token.
  // May be, one day we will add .deepClone() for token and simplify this part, but
  // now we prefer to keep things local.
  if (info) {
    switch (langName) {
      case 'latex':
      case 'ce':
        return highlighted
      default:
        const i = token.attrIndex('class')
        const attrs = token.attrs ? token.attrs.slice() : []

        if (i < 0) {
          attrs.push(['class', 'language-' + langName])
        } else {
          attrs[i] = attrs[i].slice()
          attrs[i][1] += ' ' + 'language-' + langName
        }

        result =
          '<pre><code' +
          self.renderAttrs({ attrs }) +
          '>' +
          highlighted +
          '</code></pre>\n'
    }
  }

  result =
    '<pre><code' +
    self.renderAttrs(token) +
    '>' +
    highlighted +
    '</code></pre>\n'
  return result
    .replace('<code class="', '<code class="hljs ')
    .replace('<code>', '<code class="hljs">')
}

md.use(emoji)
md.use(sup)
md.use(sub)
md.use(deflist)

export default function render(s: string): string {
  return md.render(s)
}
