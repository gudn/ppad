<script lang="ts">
  import { onMount } from 'svelte'
  import type { NavigateFn } from 'svelte-navigator'
  import { attach, createEffect, createEvent, restore, sample } from 'effector'
  import Fuse from 'fuse.js'

  import Input from '../components/Input.svelte'

  import documents from '../store/documents'
  import type { PDocument } from '../models/documents'

  const allDocuments = documents.all

  let documentsList: HTMLElement
  const selectDocument = createEvent<string | null>('selectDocument')
  const selectedDocumentKey = restore(selectDocument, null)
  export let navigate: NavigateFn

  onMount(() => {
    documents.refreshAll()
  })

  function createDocument(title: string) {
    documents.create(title).then(doc => navigate(`/doc/${doc.key}`))
  }

  selectedDocumentKey.watch(key => {
    documentsList?.querySelector('.selected')?.classList.remove('selected')
    if (!key) return
    const selected = documentsList?.querySelector(`[data-dockey='${key}']`)
    if (!selected) return
    selected.classList.add('selected')
    selected.scrollIntoView()
  })

  const searchUpdate = createEvent<string>('searchUpdate')
  sample({
    source: allDocuments.map(
      docs =>
        new Fuse(docs, {
          keys: ['title'],
        }),
    ),
    clock: searchUpdate,
    fn: (fuse, value) => ({ fuse, value }),
    target: createEffect((params: { fuse: Fuse<PDocument>; value: string }) => {
      const { fuse, value } = params
      console.log(value)
      if (!value) {
        selectDocument(null)
        return
      }
      const res = fuse.search(value, { limit: 1 })
      if (!res.length) {
        selectDocument(null)
        return
      }
      selectDocument(res[0].item.key)
    }),
  })

  const openOrCreateFx = attach({
    source: selectedDocumentKey,
    mapParams: (title: string, key: string | null) => ({ title, key }),
    effect: createEffect((params: { title: string; key: string | null }) => {
      const { title, key } = params
      if (key === null) createDocument(title)
      else navigate(`/doc/${key}`)
    }),
  })

  function searchSubmit(e: CustomEvent<{ alt: boolean; value: string }>) {
    const value = e.detail.value
    if (e.detail.alt) createDocument(value)
    else openOrCreateFx(value)
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
    <div class="input">
      <Input
        on:submit={searchSubmit}
        on:update={e => searchUpdate(e.detail.value)}
      >
        <span class="icon" slot="icon" />
      </Input>
    </div>
    <button>New</button>
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
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5em;

      h1 {
        margin: 0;
      }

      .input {
        flex: 1;

        span.icon {
          background-image: url('/icons/search.svg');
          background-size: 18px 18px;
          min-width: 100%;
          min-height: 100%;
          filter: invert(93.3%);
        }
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
      }

      hr {
        margin: 0;
      }

      & > :global(p.selected) {
        border-left: 3px solid $secondary-color !important;
      }
    }
  }

  button {
    background-color: $secondary-color;
    color: $text-color;
    border-radius: 6px;
    border: none;
    padding: 4px 6px;
  }
</style>
