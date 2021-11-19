<script lang="ts">
  export let key: string
</script>

<header>
  Title
  <hr />
</header>

<main>
  <p>{key}</p>
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
