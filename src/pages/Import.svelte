<script lang="ts">
  import type { NavigateFn } from 'svelte-navigator'

  import { importDocument } from '../utils/importDocument'
  let files: FileList
  export let navigate: NavigateFn

  function submit() {
    if (files.length !== 1) return
    const file = files[0]
    const reader = new FileReader()
    reader.addEventListener('load', async e => {
      const text = e.target.result
      const data = JSON.parse(text as string)
      await importDocument(data)
      navigate(`/doc/${data.key}`)
    })
    reader.readAsText(file)
  }
</script>

<main>
  <form on:submit|preventDefault={submit}>
    <input type="file" id="file" name="file" accept=".json" bind:files />
    <button type="submit">Import</button>
  </form>
</main>

<style lang="scss">
  @import '../styles/variables.scss';

  main {
    margin: 0.5em;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: start;
  }

  button {
    background-color: $secondary-color;
    color: $text-color;
    border-radius: 6px;
    border: none;
    padding: 4px 6px;
  }
</style>
