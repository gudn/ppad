<script lang="ts">
  import { onMount } from 'svelte'
  import { Router, Route } from 'svelte-navigator'

  import Home from './pages/Home.svelte'
  import Document from './pages/Document.svelte'

  import { openDBFx } from './store/db'

  let dbPromise: Promise<any>

  onMount(() => {
    dbPromise = openDBFx()
  })
</script>

{#await dbPromise}
  Waiting database...
{:then _}
  <Router primary={false}>
    <Route path="/">
      <Home />
    </Route>
    <Route path="/doc/:id" component={Document} />
  </Router>
{:catch err}
  <p class="error">{err.toString()}</p>
{/await}

<style lang="scss">
  .error {
    color: red;
  }
</style>
