<script lang="ts">
  import type { PDocument } from '../models/documents'

  export let doc: PDocument
</script>

<header>
  <h4>{doc.title}</h4>
  <hr />
</header>

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
</style>
