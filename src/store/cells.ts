import { clearNode, createDomain, Store } from 'effector'

import type { PCell } from '../models/cells'
import {
  deleteFx,
  deleteWhereFx,
  insertOneFx,
  selectAllWhere,
  updateFx,
} from './db'

export interface Cells {
  all: Store<PCell[]>

  // id will be excluded
  insert: (cell: PCell) => Promise<PCell>
  update: (cell: PCell) => Promise<PCell>
  deleteByKey: (key: number) => Promise<number>
  deleteByRank: (rank: string) => Promise<number>
  clean: () => void
}

export default async function cellsFromDocument(
  docKey: string,
): Promise<Cells> {
  const rankPrefixLength = docKey.length + 1
  const selectedCells: PCell[] = await selectAllWhere({
    collection: 'cells',
    index: 'pid-rank',
    where: IDBKeyRange.bound(`${docKey}-`, `${docKey}.`, true, true),
  })

  const domain = createDomain(docKey)

  const insertCellFx = domain.createEffect(async (cell: PCell) => {
    const { key: _, ...value } = cell
    const key = (await insertOneFx({
      collection: 'cells',
      value: { ...value, rank: `${docKey}-${value.rank}` },
    })) as number
    return { ...cell, key }
  })

  const deleteByKeyFx = domain.createEffect(
    async (key: number): Promise<number> => {
      await deleteFx([{ collection: 'cells', key }])
      return key
    },
  )

  const deleteByRankFx = domain.createEffect(async (rank: string) => {
    const where = `${docKey}-${rank}`
    const keys = await deleteWhereFx({
      collection: 'cells',
      index: 'pid-rank',
      where,
    })
    return keys[0] as number
  })

  const updateCellFx = domain.createEffect(async (cell: PCell) => {
    await updateFx({
      collection: 'cells',
      value: { ...cell, rank: `${docKey}-${cell.rank}` },
    })
    return cell
  })

  const all: Store<PCell[]> = domain
    .createStore(
      selectedCells.map(cell => ({
        ...cell,
        rank: cell.rank.slice(rankPrefixLength),
      })),
      {
        name: `cells of ${docKey}`,
      },
    )
    .on(insertCellFx.doneData, (cells, newCell) => {
      return [...cells, newCell] // TODO add sorting
    })
    .on(deleteByKeyFx.doneData, (cells, deletedKey) =>
      cells.filter(cell => cell.key !== deletedKey),
    )
    .on(deleteByRankFx.doneData, (cells, deletedKey) =>
      cells.filter(cell => cell.key !== deletedKey),
    )
    .on(updateCellFx.doneData, (cells, updatedCell) => {
      let rankChanged = false
      const result = cells.map(cell => {
        if (cell.key !== updatedCell.key) return cell
        else {
          rankChanged = cell.rank !== updatedCell.rank
          return updatedCell
        }
      })
      // TODO resort cells
      if (rankChanged) throw 'unimplemented'
      return result
    })

  return {
    all,
    insert: insertCellFx,
    update: updateCellFx,
    deleteByKey: deleteByKeyFx,
    deleteByRank: deleteByRankFx,
    clean() {
      clearNode(domain)
    },
  }
}
