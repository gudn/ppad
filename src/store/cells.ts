import sort from 'sort-es'
import { LexoRank } from '@wewatch/lexorank'
import { attach, clearNode, createDomain, Store } from 'effector'

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
  low: {
    insert: (cell: PCell) => Promise<PCell>
    update: (cell: PCell) => Promise<PCell>
    deleteByKey: (key: number) => Promise<number>
  }
  high: {
    createEmptyFirst: () => Promise<PCell>
    createEmptyLast: () => Promise<PCell>
    deleteByRank: (rank: string) => Promise<number>
    // createEmptyBetween: (rank1: string, rank2: string) => Promise<PCell>
  }
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
    .on(insertCellFx.doneData, (cells, newCell) =>
      [...cells, newCell].sort(
        sort.byValue(cell => cell.rank, sort.byString()),
      ),
    )
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
      if (rankChanged)
        return result.sort(sort.byValue(cell => cell.rank, sort.byString()))
      return result
    })

  const createEmptyLastFx = attach({
    name: 'createEmptyFirst',
    source: all,
    mapParams: (_, cells) => cells.slice(-1)[0] ?? null,
    effect: domain.createEffect(async (lastCell: PCell | null) => {
      const lastRank = lastCell
        ? LexoRank.parse(lastCell.rank)
        : LexoRank.middle()
      const cell = {
        content: {
          content: '',
          rendered: '',
        },
        rank: lastRank.genNext().toString(),
      }
      const key = (await insertOneFx({
        collection: 'cells',
        value: { ...cell, rank: `${docKey}-${cell.rank}` },
      })) as number
      return { ...cell, key }
    }),
  })

  const createEmptyFirstFx = attach({
    name: 'createEmptyFirst',
    source: all,
    mapParams: (_, cells) => cells[0] ?? null,
    effect: domain.createEffect(async (firstCell: PCell | null) => {
      const firstRank = firstCell
        ? LexoRank.parse(firstCell.rank)
        : LexoRank.middle()
      const cell = {
        content: {
          content: '',
          rendered: '',
        },
        rank: firstRank.genPrev().toString(),
      }
      // Optimize for avoid sorting
      const key = (await insertOneFx({
        collection: 'cells',
        value: { ...cell, rank: `${docKey}-${cell.rank}` },
      })) as number
      return { ...cell, key }
    }),
  })

  all
    .on(createEmptyLastFx.doneData, (cells, newCell) => [...cells, newCell])
    .on(createEmptyFirstFx.doneData, (cells, newCell) => [newCell, ...cells])

  return {
    all,
    low: {
      insert: insertCellFx,
      update: updateCellFx,
      deleteByKey: deleteByKeyFx,
    },
    high: {
      createEmptyFirst: () => createEmptyFirstFx(undefined),
      createEmptyLast: () => createEmptyLastFx(undefined),
      deleteByRank: deleteByRankFx,
    },
    clean() {
      clearNode(domain)
    },
  }
}
