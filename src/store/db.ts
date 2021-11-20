import { attach, createEffect, createStore } from 'effector'
import { openDB, IDBPDatabase } from 'idb'

export const openDBFx = createEffect({
  name: 'openDB',
  handler(): Promise<IDBPDatabase> {
    return new Promise(async (resolve, reject) => {
      const db = await openDB('ppad', 1, {
        upgrade(db, _oldVersion, _newVersion, tx) {
          db.createObjectStore('documents', {
            keyPath: 'key',
          })
          const cells = db.createObjectStore('cells', {
            keyPath: 'key',
            autoIncrement: true,
          })
          cells.createIndex('pid-rank', 'rank')
        },
        blocked() {
          reject('connection blocked')
        },
        blocking() {
          reject('database in blocking state')
        },
        terminated() {
          reject('connection terminated')
        },
      })
      resolve(db)
    })
  },
})

openDBFx.failData.watch(console.error)

export const db = createStore<IDBPDatabase | null>(null, { name: 'db' }).on(
  openDBFx.doneData,
  (_, newDB) => newDB,
)

export const insertFx = attach({
  name: 'insert',
  source: db,
  mapParams: (
    objs: { collection: string; value: any }[],
    db: IDBPDatabase | null,
  ) => ({
    objs,
    db,
  }),
  effect: createEffect(
    async (params: {
      objs: {
        collection: string
        value: any
      }[]
      db: IDBPDatabase | null
    }) => {
      const { objs, db } = params
      if (db === null) throw 'database is uninitialized'
      const collections = new Set()
      for (const { collection } of objs) collections.add(collection)
      // @ts-ignore
      const tx = db.transaction(Array.from(collections.values()), 'readwrite')
      const operations = objs
        .map(
          ({ collection, value }): Promise<any> =>
            tx.objectStore(collection).add(value),
        )
        .concat([tx.done])
      await Promise.all(operations)
    },
  ),
})

export const deleteFx = attach({
  name: 'delete',
  source: db,
  mapParams: (
    objs: { collection: string; key: string | number }[],
    db: IDBPDatabase | null,
  ) => ({ objs, db }),
  effect: createEffect(
    async (params: {
      objs: {
        collection: string
        key: string | number
      }[]
      db: IDBPDatabase | null
    }) => {
      const { objs, db } = params
      if (db === null) throw 'database is uninitialized'
      const collections = new Set()
      for (const { collection } of objs) collections.add(collection)
      // @ts-ignore
      const tx = db.transaction(Array.from(collections.values()), 'readwrite')
      const operations = objs
        .map(
          ({ collection, key }): Promise<any> =>
            tx.objectStore(collection).delete(key),
        )
        .concat([tx.done])
      await Promise.all(operations)
    },
  ),
})

export const selectAllFx = attach({
  name: 'selectAll',
  source: db,
  mapParams: (
    params: {
      collection: string
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: { collection: string; db: IDBPDatabase | null }) => {
      const { collection, db } = params
      const result: any[] = []
      let cursor = await db.transaction(collection).store.openCursor()
      while (cursor) {
        result.push(cursor.value)
        cursor = await cursor.continue()
      }
      return result
    },
  ),
})

export const selectFx = attach({
  name: 'select',
  source: db,
  mapParams: (
    params: {
      collection: string
      key: string | number
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      key: string | number
      db: IDBPDatabase | null
    }) => {
      const { collection, key, db } = params
      return await db.get(collection, key)
    },
  ),
})

export const selectKeyBy = attach({
  name: 'selectKeyBy',
  source: db,
  mapParams: (
    params: {
      collection: string
      index: string
      value: string | number | IDBKeyRange
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      index: string
      value: string | number | IDBKeyRange
      db: IDBPDatabase | null
    }): Promise<string | number> => {
      const { collection, index, value, db } = params
      const key = await db.getKeyFromIndex(collection, index, value)
      const keyType = typeof key
      if (keyType !== 'number' && keyType !== 'string')
        throw `invalid key type ${keyType}`
      return key as string | number
    },
  ),
})
