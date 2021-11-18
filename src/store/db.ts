import { createEffect, createStore } from 'effector'
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
            keyPath: 'id',
            autoIncrement: true,
          })
          cells.createIndex('parentId', 'pid')
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
