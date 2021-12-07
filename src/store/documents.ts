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
  transactionFx,
} from './db'

const transliter = new CyrillicToTranslit()

function titleToKey(title: string): [string, string] {
  title = title.replace(/\s/gm, ' ')
  const key = transliter.transform(title, '_').replace(/\//g, '__slash__')
  return [title, key]
}

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
  let key: string
  ;[title, key] = titleToKey(title)
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

const renameDocumentFx = createEffect(
  async ({
    key,
    newTitle,
  }: {
    key: string
    newTitle: string
  }): Promise<[string, PDocument]> => {
    const [title, newKey] = titleToKey(newTitle)
    const prefixLength = key.length + 1
    const res = await transactionFx({
      collections: ['documents', 'cells'],
      rdonly: false,
      async handler(tx) {
        const docStore = tx.objectStore('documents')
        await docStore.delete(key)
        await docStore.add({ key: newKey, title })
        let cursor = await tx
          .objectStore('cells')
          .index('pid-rank')
          .openCursor(IDBKeyRange.bound(`${key}-`, `${key}.`, false, false))
        while (cursor) {
          const rank: string = cursor.value.rank
          if (rank.length === prefixLength)
            await cursor.update({ ...cursor.value, rank: `${newKey}.` })
          else
            await cursor.update({
              ...cursor.value,
              rank: `${newKey}-${rank.slice(prefixLength)}`,
            })
          cursor = await cursor.continue()
        }
        return true
      },
    })
    if (!res) throw 'Error renaming'
    return [key, { key: newKey, title }]
  },
)

const all = restore<PDocument[]>(selectAllDocumentsFx.doneData, [])
  .on(createDocumentFx.doneData, (docs, newDoc) => [...docs, newDoc])
  .on(deleteDocumentFx.doneData, (docs, removedKey) =>
    docs.filter(it => it.key !== removedKey),
  )
  .on(renameDocumentFx.doneData, (docs, [key, newDoc]) =>
    docs.map(doc => {
      if (doc.key !== key) return doc
      else return newDoc
    }),
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
  rename: renameDocumentFx,
  getDocument(key: string): Promise<PDocument | undefined> {
    return selectDocumentFx(key)
  },
}

export default documents
