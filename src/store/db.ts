import { attach, createEffect, createStore } from 'effector'
import { openDB, IDBPDatabase, IDBPTransaction } from 'idb'

export const openDBFx = createEffect({
  name: 'openDB',
  handler(): Promise<IDBPDatabase> {
    return new Promise(async (resolve, reject) => {
      const db = await openDB('ppad', 1, {
        upgrade(db, _oldVersion, _newVersion, _tx) {
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

openDBFx()

export const transactionFx = attach({
  name: 'transaction',
  source: db,
  mapParams: (
    params: {
      collections: string[]
      handler: <M extends IDBTransactionMode = 'readonly'>(
        tx: IDBPTransaction<unknown, string[], M>,
      ) => Promise<boolean>
      rdonly: boolean
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collections: string[]
      handler: <M extends IDBTransactionMode>(
        tx: IDBPTransaction<unknown, string[], M>,
      ) => Promise<boolean>
      rdonly: boolean
      db: IDBPDatabase | null
    }) => {
      const { collections, db, handler } = params
      const tx = db.transaction(
        collections,
        params.rdonly ? 'readonly' : 'readwrite',
      )
      const res = await handler(tx)
      if (!res) tx.abort()
      await tx.done
      return res
    },
  ),
})

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

export const insertOneFx = attach({
  name: 'insertOne',
  source: db,
  mapParams: (
    params: {
      collection: string
      value: any
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      value: any
      db: IDBPDatabase | null
    }): Promise<string | number> => {
      const { collection, value, db } = params
      const key = await db.add(collection, value)
      const keyType = typeof key
      if (keyType !== 'number' && keyType !== 'string')
        throw `invalid key type ${keyType}`
      return key as string | number
    },
  ),
})

export const updateFx = attach({
  name: 'update',
  source: db,
  mapParams: (
    params: {
      collection: string
      value: any
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      value: any
      db: IDBPDatabase | null
    }) => {
      const { collection, value, db } = params
      if (db === null) throw 'database is uninitialized'
      const keyType = typeof value.key
      if (keyType !== 'number' && keyType !== 'string')
        throw 'value has invalid key'
      await db.put(collection, value)
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

export const deleteWhereFx = attach({
  name: 'deleteWhere',
  source: db,
  mapParams: (
    params: {
      collection: string
      index: string
      where: IDBKeyRange | string | number
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      index: string
      where: IDBKeyRange | string | number
      db: IDBPDatabase | null
    }) => {
      const { collection, index, where, db } = params
      if (db === null) throw 'database is uninitialized'
      const tx = db.transaction(collection, 'readwrite')
      let cursor = await tx.store.index(index).openCursor(where)
      const keys = []
      while (cursor) {
        const key = cursor.key
        const keyType = typeof key
        if (keyType !== 'number' && keyType !== 'string')
          throw `invalid key type ${keyType}`
        keys.push(key as string | number)
        await cursor.delete()
        cursor = await cursor.continue()
      }
      await tx.done
      return keys
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

export const selectAllWhere = attach({
  name: 'selectAllWhere',
  source: db,
  mapParams: (
    params: {
      collection: string
      index: string
      where: IDBKeyRange
    },
    db: IDBPDatabase | null,
  ) => ({ ...params, db }),
  effect: createEffect(
    async (params: {
      collection: string
      index: string
      where: IDBKeyRange
      db: IDBPDatabase | null
    }): Promise<any[]> => {
      const { collection, index, where, db } = params
      const tx = db.transaction(collection)
      let cursor = await tx.store.index(index).openCursor(where)
      const result: any[] = []
      while (cursor) {
        result.push(cursor.value)
        cursor = await cursor.continue()
      }
      await tx.done
      return result
    },
  ),
})
