<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { Tldraw, TldrawApp } from '@tldraw/tldraw'
  import debounce from 'lodash.debounce'

  const styleChild: HTMLStyleElement = document.createElement('style')
  styleChild.innerText = `* { box-sizing: border-box; }`

  export let key: string
  let root: HTMLElement

  function onChange(app: TldrawApp) {
    // TODO
  }

  function mountedTldraw(app: TldrawApp) {
    app.toggleDarkMode()
  }

  onMount(() => {
    document.head.appendChild(styleChild)
    ReactDOM.render(
      React.createElement(Tldraw, {
        onChange: debounce(onChange, 500),
        onMount: mountedTldraw
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
