<script lang="ts">
  import type { PCell } from '../../models/cells'

  import CellButtons from './CellButtons.svelte'

  export let cell: PCell
</script>

<section>
  <div>
    {cell.key} - {cell.rank}
  </div>
  <CellButtons>
    Buttons
  </CellButtons>
</section>

<style lang="scss">
  section {
    position: relative;
  }
</style>
