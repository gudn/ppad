<script lang="ts" context="module">
  import { writable, Writable } from 'svelte/store'

  const currentActiveKey: Writable<number | null> = writable(null)
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { Splide, SplideSlide } from '@splidejs/svelte-splide'
  import '@splidejs/splide/dist/css/splide.min.css'
  import debounce from 'lodash.debounce'

  import type { PCell } from '../../models/cells'
  import renderMd from '../../render'

  import CellButtons from './CellButtons.svelte'

  const dispatch = createEventDispatcher()

  export let cell: PCell
  export let index: number

  $: inEditing = $currentActiveKey === cell.key

  let root: HTMLElement
  let content = ''
  let rendered = ''

  const updateRendered = debounce(
    (content: string) => (rendered = renderMd(content)),
    500,
  )

  function htmlIsEmpty(html: string): boolean {
    const elem = document.createElement('div')
    elem.innerHTML = html
    return elem.innerText.trim() === ''
  }

  $: updateRendered(content)

  function finishEditing() {
    content = content.trim()
    if (!content && cell.drawing === null) dispatch('delete', cell.key)
    else if (content !== cell.content.content) {
      try {
        rendered = renderMd(content)
        if (!htmlIsEmpty(rendered))
          dispatch('update', {
            ...cell,
            content: {
              content,
              rendered,
            },
          })
        else if (cell.drawing === null) dispatch('delete', cell.key)
      } catch (e) {
        console.error(e)
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

    function updateHeight(e: KeyboardEvent | null) {
      if (e?.code === 'Enter') {
        const value = node.value
        const splitIndex = value.indexOf('\n\n\n\n')
        if (splitIndex !== -1) {
          content = value.slice(0, splitIndex).trim()
          node.blur()
          const after = value.slice(splitIndex + 4).trim()
          const afterRendered = renderMd(after).trim()
          if (!content || htmlIsEmpty(afterRendered)) dispatch('createNext', [index, null])
          else
            dispatch('createNext', [
              index,
              { content: after, rendered: afterRendered },
            ])
          return
        }
      }
      if (e?.code === 'Escape') node.blur()
      node.style.height = '0'
      const height = node.scrollHeight + 2
      node.style.height = `${height}px`
    }

    updateHeight(null)

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
      {#if cell.drawing}
        <div on:click|stopPropagation>
          <Splide>
            {#each Object.entries(cell.drawing.svgs) as [name, content] (name)}
              <SplideSlide>
                <div class="svg-wrapper">
                  {@html content}
                </div>
              </SplideSlide>
            {/each}
          </Splide>
        </div>
      {/if}
      <div class="rendered">
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
    font-family: 'JetBrains Mono', monospace;
  }

  .rendered {
    :global(iframe),
    :global(video),
    :global(img) {
      margin: 0.3em auto;
      display: block;
      max-width: 100%;
    }
  }

  .svg-wrapper {
    display: flex;
    margin: 0 auto;
    justify-content: center;
    align-items: center;

    :global(svg text) {
      fill: $text-color;
    }
  }
</style>
