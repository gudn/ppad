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

export default latex
