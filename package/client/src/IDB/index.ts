export const MODE = {
  R: 'readonly',
  RW: 'readwrite',
} as const;

export default class IDB {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  getObjectStore(storeName: string, mode: 'readonly' | 'readwrite') {
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  getObjectStores(storeNames: string[], mode: 'readonly' | 'readwrite') {
    const t = this.db.transaction(storeNames, mode);

    return storeNames.map((storeName) => t.objectStore(storeName));
  }

  add<V = unknown>(storeName: string, value: V): Promise<V> {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(storeName, MODE.RW).add(value);

      request.onsuccess = () => resolve(value);
      request.onerror = () => reject(request.error);
    });
  }

  delete<K extends IDBValidKey>(storeName: string, key: K): Promise<K> {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(storeName, MODE.RW).delete(key);

      request.onsuccess = () => resolve(key);
      request.onerror = () => reject(request.error);
    });
  }

  put<V = unknown>(storeName: string, key: IDBValidKey, value: V): Promise<V> {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(storeName, MODE.RW).openCursor(key);

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;

        if (cursor) {
          console.log(cursor.value);
          // cursor.update(value);
          // cursor.continue();
          resolve(value);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  getAll<V>(storeName: string): Promise<V> {
    const store = this.getObjectStore(storeName, MODE.R);

    return this.getAllFromStore<V>(store);
  }

  getAllFromStores<V>(storeNames: string[]): Promise<V[]> {
    const stores = this.getObjectStores(storeNames, MODE.R);

    return Promise.all(stores.map((store) => this.getAllFromStore<V>(store)));
  }

  private getAllFromStore<V>(store: IDBObjectStore): Promise<V> {
    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as V);
      request.onerror = () => reject(request.error);
    });
  }
}
