<script lang="ts">
  import type { Cells } from '../../store/cells'

  import CellCreateButton from './CellCreateButton.svelte'
  import Cell from './Cell.svelte'

  export let cells: Cells

  $: all = cells.all

  function createCellAtIndex(index: number) {
    switch (index) {
      case 0:
        cells.high.createEmptyFirst()
        break
      case $all.length:
        cells.high.createEmptyLast()
        break
    }
  }

  function clickHandler(e: MouseEvent) {
    let target = e.target as HTMLElement
    while (!target.classList.contains('click-handler'))
      target = target.parentElement
    if (target.classList.contains('create-cell'))
      createCellAtIndex(parseInt(target.dataset.index))
    else if (target.classList.contains('delete-cell'))
      cells.low.deleteByKey(parseInt(target.dataset.key))
    else if (target.classList.contains('up-cell'))
      console.log('TODO')
    else if (target.classList.contains('down-cell'))
      console.log('TODO')
  }
</script>

<div on:click={clickHandler}>
  <CellCreateButton index={0} />
  {#each $all as cell, index (cell.key)}
    <Cell {cell} />
    <CellCreateButton index={index + 1} />
  {/each}
</div>

<!-- <div style="margin-top: 1em;"/> -->
