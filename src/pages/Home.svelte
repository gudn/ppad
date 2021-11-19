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
  <span slot="icon" />
</Input>

<div class="documents-list">
  {#each $allDocuments as doc (doc.key)}
    <p>{doc.title}</p>
  {/each}
</div>

<style lang="scss">
  span {
    background-image: url('/icons/search.svg');
    background-size: 20px 20px;
    min-width: 20px;
    box-sizing: content-box;
    margin: 2px;
    filter: invert(93.3%);
  }
</style>
