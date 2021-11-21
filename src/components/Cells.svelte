<script lang="ts">
  import type { Cells } from '../store/cells'

  export let cells: Cells
</script>

{cells.toString()}

<footer>
  <button>
    <span class="icon" />
    <span class="label">Create</span>
  </button>
</footer>

<style lang="scss">
  @import '../styles/variables.scss';

  footer {
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
