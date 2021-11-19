<script lang="ts">
  import Input from '../components/Input.svelte'

  import documents from '../store/documents'

  let search: string = ''

  function searchSubmit(e: CustomEvent<string>) {
    search = e.detail
    documents.create(search).then(console.log)
  }
</script>

<h1>PPad</h1>
<Input bind:value={search} on:submit={searchSubmit}>
  <span slot="icon" />
</Input>

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
