<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { readable } from 'svelte/store'

  import documents from '../store/documents'
  import getCells, { Cells } from '../store/cells'

  export let key: string

  let cells: Cells | null = null

  $: all = cells?.all ?? readable([])

  onMount(async () => {
    cells = await getCells(key)
    document.title = (await documents.getDocument(key)).title
  })

  onDestroy(() => {
    if (cells) cells.clean()
  })
</script>

<main>
  {#each $all as cell (cell.key)}
    {#if cell.drawing}
      {#each Object.entries(cell.drawing.svgs) as [name, content] (name)}
        <div class="svg-wrapper">
          {@html content}
        </div>
      {/each}
    {/if}
    <div class="rendered">
      {@html cell.content.rendered}
    </div>
  {/each}
</main>

<style lang="scss">
  @import '../styles/variables.scss';

  main {
    margin: 0.3em 1em;
    padding: 0.3em 0;
    overflow: scroll;

    &::-webkit-scrollbar {
      width: 0;
      background-color: transparent;
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
  }
</style>
