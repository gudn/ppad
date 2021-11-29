<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { Tldraw, TldrawApp, TDDocument } from '@tldraw/tldraw'
  import debounce from 'lodash.debounce'
  import { navigate } from 'svelte-navigator'

  import type { PCell } from '../models/cells'
  import { selectFx, updateFx } from '../store/db'

  const styleChild: HTMLStyleElement = document.createElement('style')
  styleChild.innerText = `* { box-sizing: border-box; }`

  export let key: string

  let root: HTMLElement
  let cell: PCell | null = null

  function shapes(app: TldrawApp): { [page: string]: string } {
    const res = {}
    for (const [page, content] of Object.entries(app.document.pages)) {
      const svg = app.copySvg(Object.keys(content.shapes), page)
      if (svg) {
        res[page] = svg
      }
    }
    return res
  }

  function onChange(app: TldrawApp) {
    const svgs = shapes(app)
    let value: PCell = {
      ...cell,
      drawing: Object.keys(svgs).length ? { doc: app.document, svgs } : null,
    }
    updateFx({
      collection: 'cells',
      value
    })
  }

  function mountedTldraw(app: TldrawApp) {
    app.toggleDarkMode()
  }

  onMount(async () => {
    cell = await selectFx({
      collection: 'cells',
      key: parseInt(key),
    })
    if (!cell) navigate(-1)
    const doc = cell.drawing ? { document: cell.drawing.doc } : {}
    document.head.appendChild(styleChild)
    ReactDOM.render(
      React.createElement(Tldraw, {
        onChange: debounce(onChange, 500),
        onMount: mountedTldraw,
        ...doc,
      }),
      root,
    )
  })

  onDestroy(() => {
    try {
      ReactDOM.unmountComponentAtNode(root)
    } catch (e) {
      console.error(e)
    }
    document.head.removeChild(styleChild)
  })
</script>

<div bind:this={root} />

<style lang="scss">
  div {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    padding: 0;
    margin: 0;

    width: 100%;
    height: 100%;
  }
</style>
