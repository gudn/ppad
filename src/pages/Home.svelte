<script lang="ts">
  import { onMount } from 'svelte'
  import type { NavigateFn } from 'svelte-navigator'
  import { createEffect, createEvent, sample } from 'effector'
  import Fuse from 'fuse.js'

  import Input from '../components/Input.svelte'

  import documents from '../store/documents'
  import type { PDocument } from '../models/documents'

  const allDocuments = documents.all

  let search: string = ''
  let documentsList: HTMLElement
  export let navigate: NavigateFn

  onMount(() => {
    documents.refreshAll()
  })

  function searchSubmit(e: CustomEvent<string>) {
    search = e.detail.trim()
    documents.create(search).then(doc => navigate(`/doc/${doc.key}`))
  }

  function selectDocument(key: string | null) {
    documentsList.querySelector('.selected')?.classList.remove('selected')
    if (key === null) return
    const selected = documentsList.querySelector(`[data-dockey='${key}']`)
    if (!selected) return
    selected.classList.add('selected')
    selected.scrollIntoView()
  }

  const searchUpdate = createEvent('searchUpdate')
  sample({
    source: allDocuments.map(
      docs =>
        new Fuse(docs, {
          keys: ['title'],
        }),
    ),
    clock: searchUpdate,
    target: createEffect((fuse: Fuse<PDocument>) => {
      let trimmed = search.trim()
      if (!trimmed) {
        selectDocument(null)
        return
      }
      const res = fuse.search(trimmed, { limit: 1 })
      if (!res.length) {
        selectDocument(null)
        return
      }
      selectDocument(res[0].item.key)
    }),
  })

  $: {
    // TODO HACK watch search update
    // replace with debounces function call
    console.log(search)
    searchUpdate()
  }

  function openHandler(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'BUTTON') return
    const key = target.parentElement.dataset.dockey
    navigate(`/doc/${key}`)
  }
</script>

<div class="wrapper">
  <header>
    <h1>PPad</h1>
    <Input bind:value={search} on:submit={searchSubmit}>
      <span class="icon" slot="icon" />
    </Input>
  </header>

  <main on:click={openHandler} bind:this={documentsList}>
    {#each $allDocuments as doc (doc.key)}
      <hr />
      <p data-dockey={doc.key}>
        <span>{doc.title}</span>
        <button>Open</button>
      </p>
    {/each}
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

    header {
      margin: 1em;

      span.icon {
        background-image: url('/icons/search.svg');
        background-size: 18px 18px;
        min-width: 100%;
        min-height: 100%;
        filter: invert(93.3%);
      }
    }

    main {
      margin: 1em;
      margin-top: 0.6em;
      overflow: scroll;

      &::-webkit-scrollbar {
        width: 0;
        background-color: transparent;
      }

      p {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.3em;
        margin: 0.3em 0;
        border-left: 3px solid transparent;

        button {
          background-color: $secondary-color;
          color: $text-color;
          border-radius: 6px;
          border: none;
          padding: 4px 6px;
        }
      }

      hr {
        margin: 0;
      }

      & > :global(p.selected) {
        border-left: 3px solid $secondary-color !important;
      }
    }
  }
</style>
