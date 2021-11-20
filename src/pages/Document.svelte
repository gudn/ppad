<script lang="ts">
  import { onMount } from 'svelte'
  import { Link } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'

  import DocumentHeader from '../components/DocumentHeader.svelte'

  export let key: string

  let doc: PDocument | null = null

  onMount(async () => {
    doc = await documents.getDocument(key)
  })
</script>

{#if doc}
  <DocumentHeader {doc} />
{/if}

<main>
  {#if doc}
    <p>{key}</p>
  {:else}
    <Link to="/" replace>Return to list</Link>
  {/if}
</main>

<style lang="scss">
  @import '../styles/variables.scss';

  main {
    margin: 1em;
  }
</style>
