import init from 'am-parse'

import App from './App.svelte'

import './styles/root.scss'

init('/am_parse_bg.wasm')

const app = new App({
  target: document.body,
})

export default app
