<script lang="ts">
  import type { PCell } from '../../models/cells'

  export let cell: PCell
</script>

<div>{cell.key} - {cell.rank}</div>
