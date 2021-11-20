import CyrillicToTranslit from 'cyrillic-to-translit-js'
import { attach, createEffect, restore } from 'effector'

import type { PDocument } from '../models/documents'
import { deleteFx, insertFx, selectAllFx, selectFx, selectKeyBy } from './db'

const transliter = new CyrillicToTranslit()

const selectAllDocumentsFx = attach({
  name: 'selectAllDocuments',
  mapParams: () => ({ collection: 'documents' }),
  effect: selectAllFx,
})

const selectDocumentFx = attach({
  name: 'selectDocument',
  mapParams: (key: string) => ({ collection: 'documents', key }),
  effect: selectFx,
})

const createDocumentFx = createEffect(async (title: string) => {
  const key = transliter.transform(title, '_')
  const doc = { key, title }
  await insertFx([
    { collection: 'documents', value: doc },
    { collection: 'cells', value: { rank: `${key}.` } },
  ])
  return doc
})

const deleteDocumentFx = createEffect(async (key: string) => {
  const fictiveCellKey = await selectKeyBy({
    collection: 'cells',
    index: 'pid-rank',
    value: `${key}.`,
  })
  await deleteFx([
    { collection: 'documents', key },
    { collection: 'cells', key: fictiveCellKey },
  ])
  return key
})

const documents = {
  all: restore<PDocument[]>(selectAllDocumentsFx.doneData, [])
    .on(createDocumentFx.doneData, (docs, newDoc) => [...docs, newDoc])
    .on(deleteDocumentFx.doneData, (docs, removedKey) =>
      docs.filter(it => it.key !== removedKey),
    ),
  refreshAll: selectAllDocumentsFx,
  create: createDocumentFx,
  delete_: deleteDocumentFx,
  getDocument(key: string): Promise<PDocument | undefined> {
    return selectDocumentFx(key)
  },
}

export default documents
