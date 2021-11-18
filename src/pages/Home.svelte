<script lang="ts">
  import Input from '../components/Input.svelte'
</script>

<h1>PPad</h1>
<Input>
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
