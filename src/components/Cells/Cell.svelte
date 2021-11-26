<script lang="ts">
  import type { PCell } from '../../models/cells'

  import CellButtons from './CellButtons.svelte'

  export let cell: PCell
</script>

<section>
  <div>
    {cell.key} - {cell.rank}
  </div>
  <CellButtons {cell} />
</section>

<style lang="scss">
  @import '../../styles/variables.scss';

  section {
    position: relative;
  }
</style>
