import CyrillicToTranslit from 'cyrillic-to-translit-js'

import type { PDocument } from '../models/documents'
import { insertFx } from './db'

const transliter = new CyrillicToTranslit()

const documents = {
  async fetchList(): Promise<PDocument[]> {
    return []
  },
  async create(title: string): Promise<PDocument> {
    const key = transliter.transform(title, '_')
    const doc = { key, title }
    await insertFx({collection: 'documents', value: doc})
    return doc
  },
}

export default documents
