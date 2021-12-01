import CyrillicToTranslit from 'cyrillic-to-translit-js'
import { attach, createEffect, restore } from 'effector'
import Fuse from 'fuse.js'

import type { PDocument } from '../models/documents'
import {
  deleteFx,
  deleteWhereFx,
  insertFx,
  selectAllFx,
  selectFx,
} from './db'

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
  await deleteWhereFx({
    collection: 'cells',
    index: 'pid-rank',
    where: IDBKeyRange.bound(`${key}-`, `${key}.`, false, false),
  })
  await deleteFx([{ collection: 'documents', key }])
  return key
})

const all = restore<PDocument[]>(selectAllDocumentsFx.doneData, [])
  .on(createDocumentFx.doneData, (docs, newDoc) => [...docs, newDoc])
  .on(deleteDocumentFx.doneData, (docs, removedKey) =>
    docs.filter(it => it.key !== removedKey),
  )

const documents = {
  all,
  fuse: all.map(
    docs =>
      new Fuse(docs, {
        keys: ['title'],
      }),
  ),
  refreshAll: selectAllDocumentsFx,
  create: createDocumentFx,
  delete_: deleteDocumentFx,
  getDocument(key: string): Promise<PDocument | undefined> {
    return selectDocumentFx(key)
  },
}

export default documents
