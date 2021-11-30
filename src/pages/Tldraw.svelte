<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { Tldraw, TldrawApp } from '@tldraw/tldraw'
  import { navigate } from 'svelte-navigator'

  import type { PCell } from '../models/cells'
  import { exportSvgs } from '../utils/drawing'
  import { selectFx, updateFx } from '../store/db'

  const styleChild: HTMLStyleElement = document.createElement('style')
  styleChild.innerText = `* { box-sizing: border-box; }`

  export let key: string
  export let doc: string

  let root: HTMLElement
  let cell: PCell | null = null
  let app: TldrawApp | null = null

  async function saveChanges() {
    const svgs = exportSvgs(app)
    let value: PCell = {
      ...cell,
      drawing: Object.keys(svgs).length ? { doc: app.document, svgs } : null,
    }
    await updateFx({
      collection: 'cells',
      value,
    })
    navigate(`/doc/${doc}`, {
      state: { reload: true }
    })
  }

  function mountedTldraw(received: TldrawApp) {
    app = received
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
        onMount: mountedTldraw,
        ...doc,
      }),
      root,
    )
  })

  onDestroy(async () => {
    await saveChanges()
    document.head.removeChild(styleChild)
    app = null
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
