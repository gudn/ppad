import katex from 'katex'
import 'katex/contrib/mhchem'
import { convert_, OutputFormat } from 'am-parse'

const latexOptions = {
  output: 'html',
  throwOnError: false,
  errorColor: '#ff4444', // NOTE sync with $danger-color
}

const latex = {
  display(code: string): string {
    return katex.renderToString(code, {
      displayMode: true,
      ...latexOptions
    })
  },
  inline(code: string): string {
    return katex.renderToString(code, {
      displayMode: false,
      ...latexOptions
    })
  },
  inlineAm(code: string): string {
    return this.inline(convert_(code, OutputFormat.Latex, ''))
  },
  displayAm(code: string): string {
    return this.display(convert_(code, OutputFormat.Latex, ''))
  },
}

export default latex
