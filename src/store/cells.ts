import sort from 'sort-es'
import { LexoRank } from '@wewatch/lexorank'
import { attach, clearNode, createDomain, Store } from 'effector'

import type { PCell, PContentItem } from '../models/cells'
import type { PDocument } from '../models/documents'
import {
  deleteFx,
  deleteWhereFx,
  insertOneFx,
  selectAllWhere,
  transactionFx,
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
    swapCells: (rank1: string, rank2: string) => Promise<void>
    createEmptyAfter: (idx: number) => Promise<void>
    createAfter: (idx: number, content: PContentItem) => Promise<void>
    toJson: (doc: PDocument) => Promise<string>
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
        drawing: null,
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
        drawing: null,
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

  const swapCellsFx = domain.createEffect(
    async ({ irank1, irank2 }: { irank1: string; irank2: string }) => {
      if (irank2 < irank1) [irank1, irank2] = [irank2, irank1]
      const rank1 = `${docKey}-${irank1}`
      const rank2 = `${docKey}-${irank2}`
      const where = IDBKeyRange.bound(rank1, rank2, false, false)
      const res = await transactionFx({
        collections: ['cells'],
        rdonly: false,
        async handler(tx) {
          let cursor = await tx
            .objectStore('cells')
            .index('pid-rank')
            .openCursor(where)
          let firstKey: number | null = null
          if (cursor.value.rank === rank1) {
            firstKey = cursor.value.key as number
            await cursor.update({
              ...cursor.value,
              rank: rank2,
            })
            cursor = await cursor.continue()
          } else {
            return false
          }
          while (cursor) {
            if (cursor.value.rank !== rank2 || cursor.value.key === firstKey) {
              cursor = await cursor.continue()
            } else {
              await cursor.update({ ...cursor.value, rank: rank1 })
              return true
            }
          }
          return false
        },
      })
      if (!res) throw `error while swapping ${rank1} and ${rank2}`
      return [irank1, irank2]
    },
  )

  const createEmptyFx = attach({
    name: 'createEmptyAfter',
    source: all,
    mapParams: (params: {idx: number, content: PContentItem}, cells: PCell[]) => ({ ...params, cells }),
    effect: domain.createEffect(
      async ({ idx, content, cells }: { content:PContentItem, idx: number; cells: PCell[] }) => {
        if (idx >= cells.length) throw 'invalid index'
        const rank1 = LexoRank.parse(cells[idx].rank)
        const rank2 =
          idx === cells.length - 1
            ? rank1.genNext()
            : LexoRank.parse(cells[idx + 1].rank)
        const newRank = rank1.between(rank2).toString()
        const cell = {
          content,
          drawing: null,
          rank: newRank,
        }
        // Optimize for avoid sorting
        const key = (await insertOneFx({
          collection: 'cells',
          value: { ...cell, rank: `${docKey}-${cell.rank}` },
        })) as number
        return [idx, { ...cell, key }]
      },
    ),
  })

  const toJson = attach({
    name: 'toJson',
    source: all,
    mapParams: (doc, cells) => ({ doc, cells }),
    effect: domain.createEffect(({ doc, cells }) => {
      return JSON.stringify({
        title: doc.title,
        key: doc.key,
        cells: cells.map((cell: PCell) => {
          const { key: _, ...rest } = cell
          return rest
        }),
      })
    }),
  })

  all
    .on(createEmptyLastFx.doneData, (cells, newCell) => [...cells, newCell])
    .on(createEmptyFirstFx.doneData, (cells, newCell) => [newCell, ...cells])
    .on(swapCellsFx.doneData, (cells, [rank1, rank2]) => {
      let cell1: PCell | null = null,
        cell2: PCell | null = null
      for (let cell of cells) {
        if (cell.rank === rank1) cell2 = { ...cell, rank: rank2 }
        else if (cell.rank === rank2) cell1 = { ...cell, rank: rank1 }
      }
      return cells.map(cell => {
        switch (cell.rank) {
          case rank1:
            return cell1
          case rank2:
            return cell2
          default:
            return cell
        }
      })
    })
    .on(createEmptyFx.doneData, (cells, [idx, cell]: [number, PCell]) => [
      ...cells.slice(0, idx + 1),
      cell,
      ...cells.slice(idx + 1),
    ])

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
      swapCells: async (rank1, rank2) => {
        await swapCellsFx({ irank1: rank1, irank2: rank2 })
      },
      createEmptyAfter: async (idx: number) => {
        await createEmptyFx({idx, content: {content: '', rendered: ''}})
      },
      createAfter: async (idx: number, content: PContentItem) => {
        await createEmptyFx({idx, content})
      },
      toJson
    },
    clean() {
      clearNode(domain)
    },
  }
}
