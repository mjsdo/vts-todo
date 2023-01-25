export const MODE = {
  R: 'readonly',
  RW: 'readwrite',
} as const;

type MODE_VALUE = typeof MODE[keyof typeof MODE];

export default class IDB {
  private db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  getObjectStore(storeName: string, mode: MODE_VALUE) {
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  getObjectStores(storeNames: string[], mode: MODE_VALUE) {
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

  put<V = unknown>(
    storeName: string,
    key: IDBValidKey,
    value: Partial<V>,
  ): Promise<V> {
    return new Promise((resolve, reject) => {
      const request = this.getObjectStore(storeName, MODE.RW).openCursor(key);

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;

        if (cursor) {
          const newValue = { ...cursor.value, ...value };
          const updateRequest = cursor.update(newValue);

          updateRequest.onsuccess = () => resolve(newValue);
          updateRequest.onerror = () => reject(updateRequest.error);

          return;
        }

        reject(new Error('업데이트할 데이터가 없습니다.'));
      };

      request.onerror = () => reject(request.error);
    });
  }

  /* cursor key로 사용한 index값이 변경되면 안되서 오류?
  putAll<V extends Record<string, any> = Record<string, any>>(
    storeName: string,
    keyRange: IDBKeyRange,
    values: V[],
    index: string | undefined = 'weight',
  ): Promise<V[]> {
    return new Promise((resolve, reject) => {
      const objectStore = this.getObjectStore(storeName, MODE.RW);

      const request = index
        ? objectStore.index(index).openCursor(keyRange)
        : objectStore.openCursor(keyRange);

      const newValues: V[] = [];
      let i = -1;

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;

        if (!cursor) resolve(newValues);

        if (cursor) {
          i += 1;
          const newValue = values[i];

          const updateRequest = cursor.update(newValue);

          newValues.push(newValue);
          updateRequest.onsuccess = () => cursor.continue();
          updateRequest.onerror = () => reject(updateRequest.error);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
  */

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
