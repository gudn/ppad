<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Link } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'
  import getCells, { Cells } from '../store/cells'

  import DocumentHeader from '../components/DocumentHeader.svelte'
  import CellsComponent from '../components/Cells.svelte'

  export let key: string

  let doc: PDocument | null = null
  let cells: Cells | null = null

  onMount(async () => {
    ;[doc, cells] = await Promise.all([
      documents.getDocument(key),
      getCells(key),
    ])
  })

  onDestroy(() => {
    if (cells) cells.clean()
  })
</script>

<div class="wrapper">
  {#if doc}
    <DocumentHeader {doc} />
  {/if}

  <main>
    {#if doc && cells}
      <CellsComponent {cells} />
    {:else}
      <Link to="/" replace>Return to list</Link>
    {/if}
  </main>
</div>

<style lang="scss">
  @import '../styles/variables.scss';

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    align-items: stretch;

    main {
      margin: 0.2em 1em;
      margin-top: 0;
      overflow: scroll;

      &::-webkit-scrollbar {
        width: 0;
        background-color: transparent;
      }
    }
  }
</style>
