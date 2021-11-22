<script lang="ts">
  import type { Cells } from '../store/cells'

  export let cells: Cells

  $: all = cells.all

</script>

{#if $all.length}
  <button class="create">
    <span class="icon" />
    <span class="label">Create</span>
  </button>
{/if}

{#each $all as cell (cell.key)}
  <p>{cell.key} - {cell.rank}</p>
{/each}

<div class="button create">
  <button on:click={cells.high.createEmptyLast}>
    <span class="icon" />
    <span class="label">Create</span>
  </button>
</div>

<style lang="scss">
  @import '../styles/variables.scss';

  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: center;

      background-color: $primary-color;
      color: $text-color;
      border-radius: 6px;
      border: none;
      padding: 0.5em;
    }

    &.create button {
      .icon {
        background-image: url('/icons/add.svg');
        background-size: 18px 18px;
        min-width: 18px;
        min-height: 18px;
        filter: invert(93.3%);
        margin-right: 0.3em;
      }

      .label {
        margin-top: 2px;
      }
    }
  }
</style>
