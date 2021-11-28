<script lang="ts" context="module">
  import { writable, Writable } from 'svelte/store'
  const currentActiveKey: Writable<number | null> = writable(null)
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import debounce from 'lodash.debounce'

  import type { PCell } from '../../models/cells'

  import CellButtons from './CellButtons.svelte'

  const dispatch = createEventDispatcher()

  export let cell: PCell
  export let index: number

  $: inEditing = $currentActiveKey === cell.key

  let root: HTMLElement
  let content = ''
  let rendered = ''

  function render(content: string): string {
    return content.trim() + '!!!'
  }

  const updateRendered = debounce(
    (content: string) => (rendered = render(content)),
    500,
  )

  $: updateRendered(content)

  function finishEditing() {
    content = content.trim()
    if (!content) dispatch('delete', cell.key)
    else if (content !== cell.content.content) {
      try {
        rendered = render(content)
        dispatch('update', {
          ...cell,
          content: {
            content,
            rendered,
          },
        })
      } catch (e) {
        content = cell.content.content
        finishEditing()
      }
    }
  }

  onMount(() => {
    if (!cell.content.content) currentActiveKey.set(cell.key)
    else {
      content = cell.content.content
      rendered = cell.content.rendered
    }
  })

  function clickHandler(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA') return
    if (inEditing) currentActiveKey.set(null)
    else currentActiveKey.set(cell.key)
  }

  function editor(node: HTMLTextAreaElement) {
    node.focus()
    node.addEventListener('blur', () =>
      currentActiveKey.update(curr => (curr === cell.key ? null : curr)),
    )

    function updateHeight() {
      node.style.height = '0'
      const height = node.scrollHeight + 2
      node.style.height = `${height}px`
    }

    updateHeight()

    node.addEventListener('keyup', debounce(updateHeight, 50))

    root?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })

    return {
      destroy() {
        finishEditing()
      },
    }
  }
</script>

<section bind:this={root}>
  <div>
    <div on:click|stopPropagation={clickHandler}>
      <div>
        {@html rendered}
      </div>
      {#if inEditing}
        <textarea use:editor bind:value={content} />
      {/if}
    </div>
    <CellButtons {index} />
  </div>
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  section {
    position: relative;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    margin-top: 0.7em;
    resize: none;
    outline: none;
    background-color: $primary-color;
    color: $text-color;
    border: 1px solid $border-color;
    border-radius: 4px;
  }
</style>
