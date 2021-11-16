<script lang="ts">
  import { Router, Route } from 'svelte-navigator'

  import Home from './pages/Home.svelte'
  import Document from './pages/Document.svelte'
</script>

<Router>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/doc/:id" component={Document} />
</Router>
