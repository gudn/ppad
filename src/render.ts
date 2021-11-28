import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  linkify: true,
})

md.use(emoji)

export default function render(s: string): string {
  return md.render(s)
}
