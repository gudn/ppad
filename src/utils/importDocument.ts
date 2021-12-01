import type { PCell } from '../models/cells'
import type { PDocument } from '../models/documents'
import { transactionFx } from '../store/db'

type ImportData = {
  key: string
  title: string
  cells: Omit<PCell, 'key'>[]
}

export async function importDocument(data: ImportData) {
  const doc: PDocument = {
    key: data.key,
    title: data.title,
  }
  await transactionFx({
    collections: ['documents', 'cells'],
    rdonly: false,
    async handler(tx) {
      await tx.objectStore('documents').put(doc)
      const cellsStore = tx.objectStore('cells')
      await Promise.all(
        data.cells.map(cell =>
          cellsStore.add({ ...cell, rank: `${doc.key}-${cell.rank}` }),
        ),
      )
      await cellsStore.add({ rank: `${doc.key}.` })
      return true
    },
  })
}
