import type { Store } from 'effector'
import type { PCell } from '../models/cells'

interface Cells {
  all: Store<PCell[]>

  // id will be excluded
  insert: (cell: PCell) => Promise<PCell>
  update: (cell: PCell) => Promise<void>
  deleteByKey: (key: number) => Promise<void>
  deleteByRank: (rank: string) => Promise<void>
}

export default function cellsFromDocument(key: string): Cells {
  throw 'unimplemeted'
}
