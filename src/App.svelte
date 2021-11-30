<script lang="ts">
  import { onMount } from 'svelte'
  import { Router, Route } from 'svelte-navigator'

  import Home from './pages/Home.svelte'
  import Document from './pages/Document.svelte'
  import Tldraw from './pages/Tldraw.svelte'
  import View from './pages/View.svelte'

  import { openDBFx } from './store/db'

  let dbPending = openDBFx.pending
</script>

{#if $dbPending}
  Waiting database...
{:else}
  <Router primary={false}>
    <Route path="/" let:navigate>
      <Home {navigate} />
    </Route>
    <Route path="/doc/:key" component={Document} />
    <Route path="/view/:key" component={View} />
    <Route path="/draw/:doc/:key" component={Tldraw} />
  </Router>
{/if}

<style lang="scss">
  @import './styles/variables.scss';
</style>
