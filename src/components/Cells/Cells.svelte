<script lang="ts">
  import { navigate } from 'svelte-navigator'

  import type { Cells } from '../../store/cells'
  import type { PCell } from '../../models/cells'

  import CellCreateButton from './CellCreateButton.svelte'
  import Cell from './Cell.svelte'

  export let cells: Cells
  export let doc: string

  $: all = cells.all

  function createCellAtIndex(index: number) {
    switch (index) {
      case 0:
        cells.high.createEmptyFirst()
        break
      case $all.length:
        cells.high.createEmptyLast()
        break
      default:
        cells.high.createEmptyAfter(index - 1)
    }
  }

  function clickHandler(e: MouseEvent) {
    let target = e.target as HTMLElement
    while (!target.classList.contains('click-handler'))
      target = target.parentElement
    if (target.classList.contains('create-cell'))
      createCellAtIndex(parseInt(target.dataset.index))
    else if (target.classList.contains('delete-cell')) {
      const idx = parseInt(target.dataset.index) - 1
      cells.low.deleteByKey($all[idx].key)
    } else if (target.classList.contains('up-cell')) {
      const idx = parseInt(target.dataset.index) - 1
      if (idx === 0) return
      else {
        const rank1 = $all[idx - 1].rank
        const rank2 = $all[idx].rank
        cells.high.swapCells(rank1, rank2)
      }
    } else if (target.classList.contains('down-cell')) {
      const idx = parseInt(target.dataset.index)
      if (idx === $all.length) return
      else {
        const rank1 = $all[idx - 1].rank
        const rank2 = $all[idx].rank
        cells.high.swapCells(rank1, rank2)
      }
    } else if (target.classList.contains('draw-cell')) {
      const idx = parseInt(target.dataset.index)
      const cell = $all[idx - 1]
      if (!cell) throw 'Invalid index'
      navigate(`/draw/${doc}/${cell.key}`)
    }
  }

  function deleteHandler(e: CustomEvent<number>) {
    cells.low.deleteByKey(e.detail)
  }

  function updateHandler(e: CustomEvent<PCell>) {
    cells.low.update(e.detail)
  }
</script>

<div on:click={clickHandler}>
  <CellCreateButton index={0} />
  {#each $all as cell, index (cell.key)}
    <Cell
      {cell}
      index={index + 1}
      on:delete={deleteHandler}
      on:update={updateHandler}
    />
    <CellCreateButton index={index + 1} />
  {/each}
</div>

<!-- <div style="margin-top: 1em;"/> -->
