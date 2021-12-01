import init from 'am-parse'

import App from './App.svelte'

import './styles/root.scss'

init('/am_parse_bg.wasm')

window.addEventListener('load', async () => {
  if (navigator.serviceWorker) {
    await navigator.serviceWorker.register('/sw.js')
  }
})

const app = new App({
  target: document.body,
})

export default app
