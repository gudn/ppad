import CyrillicToTranslit from 'cyrillic-to-translit-js'
import { attach, createEffect, restore } from 'effector'

import type { PDocument } from '../models/documents'
import { insertFx, selectAllFx } from './db'

const transliter = new CyrillicToTranslit()

const selectAllDocumentsFx = attach({
  name: 'selectAllDocuments',
  mapParams: () => ({ collection: 'documents' }),
  effect: selectAllFx,
})

const createDocumentFx = createEffect(async (title: string) => {
  const key = transliter.transform(title, '_')
  const doc = { key, title }
  await insertFx({ collection: 'documents', value: doc })
  return doc
})

const documents = {
  all: restore<PDocument[]>(selectAllDocumentsFx.doneData, []).on(
    createDocumentFx.doneData,
    (docs, newDoc) => [...docs, newDoc],
  ),
  refreshAll: selectAllDocumentsFx,
  create: createDocumentFx,
}

export default documents
