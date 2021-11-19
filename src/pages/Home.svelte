<script lang="ts">
  import { onMount } from 'svelte'
  import type { NavigateFn } from 'svelte-navigator'

  import Input from '../components/Input.svelte'

  import documents from '../store/documents'

  const allDocuments = documents.all

  let search: string = ''
  export let navigate: NavigateFn

  function searchSubmit(e: CustomEvent<string>) {
    search = e.detail
    documents.create(search).then(console.log)
  }

  onMount(() => {
    documents.refreshAll()
  })

  function openHandler(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'BUTTON') return
    const key = target.dataset.dockey
    navigate(`/doc/${key}`)
  }
</script>

<header>
  <h1>PPad</h1>
  <Input bind:value={search} on:submit={searchSubmit}>
    <span class="icon" slot="icon" />
  </Input>
</header>

<main on:click={openHandler}>
  {#each $allDocuments as doc (doc.key)}
    <hr />
    <p>
      <span>{doc.title}</span>
      <button data-dockey={doc.key}>Open</button>
    </p>
  {/each}
</main>

<style lang="scss">
  @import '../styles/variables.scss';

  span.icon {
    background-image: url('/icons/search.svg');
    background-size: 20px 20px;
    min-width: 100%;
    min-height: 100%;
    filter: invert(93.3%);
  }

  main {
    margin-top: 0.6em;

    p {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3em;
      margin: 0.3em 0;

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
  }
</style>
