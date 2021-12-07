<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { useLocation, Link, navigate } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'
  import getCells, { Cells } from '../store/cells'

  import DocumentHeader from '../components/DocumentHeader.svelte'
  import CellsComponent from '../components/Cells/Cells.svelte'

  export let key: string

  let doc: PDocument | null = null
  let cells: Cells | null = null

  const location = useLocation()

  async function init() {
    ;[doc, cells] = await Promise.all([
      documents.getDocument(key),
      getCells(key),
    ])
    document.title = doc.title
  }

  onMount(async () => {
    if ($location.state.reload === true) {
      window.history.replaceState({}, '')
      window.location.reload()
    }
    await init()
  })

  onDestroy(() => {
    if (cells) cells.clean()
  })

  async function renameHandler(e: CustomEvent<string>) {
    const newTitle = e.detail
    if (newTitle === doc.title) return
    const res = await documents.rename({ key: doc.key, newTitle })
    if (!res) return
    navigate(`/doc/${res[1].key}`)
  }
</script>

<div class="wrapper">
  {#if doc}
    <DocumentHeader
      {doc}
      toJson={cells.high.toJson}
      on:rename={renameHandler}
    />
  {/if}

  <main>
    {#if doc && cells}
      <CellsComponent {cells} doc={doc.key} />
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
      margin: 0.3em 1em;
      margin-top: 0;
      padding: 0.3em 0;
      overflow: scroll;

      &::-webkit-scrollbar {
        width: 0;
        background-color: transparent;
      }
    }
  }
</style>
