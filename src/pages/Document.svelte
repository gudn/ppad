<script lang="ts">
  import { onMount } from 'svelte'
  import { Link } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'

  export let key: string

  let doc: PDocument | null = null

  onMount(async () => {
    doc = await documents.getDocument(key)
  })
</script>

<header>
  <h4>{doc?.title ?? 'Undefined'}</h4>
  <hr />
</header>

<main>
  {#if doc}
    <p>{key}</p>
  {:else}
    <Link to="/" replace>Return to list</Link>
  {/if}
</main>

<style lang="scss">
  @import '../styles/variables.scss';

  header {
    position: sticky;
    top: 0;
    background-color: $background-color;
    padding: 0.5em 1em;
    hr {
      margin-block-end: 0;
    }
  }

  main {
    margin: 1em;
  }
</style>
