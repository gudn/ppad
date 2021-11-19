<script lang="ts">
import { onMount } from 'svelte';

  import Input from '../components/Input.svelte'

  import documents from '../store/documents'

  const allDocuments = documents.all

  let search: string = ''

  function searchSubmit(e: CustomEvent<string>) {
    search = e.detail
    documents.create(search).then(console.log)
  }

  onMount(() => {
    documents.refreshAll()
  })
</script>

<h1>PPad</h1>
<Input bind:value={search} on:submit={searchSubmit}>
  <span class="icon" slot="icon" />
</Input>

<div class="documents-list">
  {#each $allDocuments as doc (doc.key)}
    <p>{doc.title}</p>
  {/each}
</div>

<style lang="scss">
  span.icon {
    background-image: url('/icons/search.svg');
    background-size: 20px 20px;
    min-width: 100%;
    min-height: 100%;
    filter: invert(93.3%);
  }
</style>
