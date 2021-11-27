<script lang="ts">
  import type { PCell } from '../../models/cells'

  import CellButtons from './CellButtons.svelte'

  export let cell: PCell
  export let index: number
</script>

<section>
  <div>
    {cell.key} - {cell.rank}
  </div>
  <CellButtons {index} />
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  section {
    position: relative;
  }
</style>
