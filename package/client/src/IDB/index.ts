/** indexed DB */

import type {
  TodoItem,
  ColumnTitle,
  AddItemField,
  UpdateItemField,
 TodoColumn } from './type';


const createItemObject = (item: Partial<TodoItem>): TodoItem => ({
  id: crypto.randomUUID(),
  createdAt: new Date(),
  title: 'TITLE',
  body: 'BODY',
  weight: Infinity,
  ...item,
});

const createUpdateItemObject = (key: string, item: TodoItem): TodoItem => ({
  ...item,
  id: key,
});

export const COLUMN_TITLE = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export const MODE = {
  R: 'readonly',
  RW: 'readwrite',
} as const;

export default class IDB {
  private initialized = false;
  private VERSION = 1;
  private db!: IDBDatabase; /** this.getDB()로 먼저 체크하기 */
  dbName = '';

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        reject(new Error('DB를 여러번 초기화할 수 없습니다.'));
      }

      this.initialized = true;

      const request = indexedDB.open(this.dbName, this.VERSION);

      request.addEventListener('error', (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      });

      request.addEventListener('success', (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      });

      request.addEventListener('upgradeneeded', (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        Object.values(COLUMN_TITLE).forEach((value) => {
          const store = db.createObjectStore(value, {
            keyPath: 'id',
          });

          store.createIndex('weight', 'weight', { unique: true });
        });
      });
    });
  }

  private getDB() {
    if (this.db) return this.db;
    throw new Error('먼저 DB를 초기화 해야합니다.');
  }

  addItem(columnTitle: ColumnTitle, field: AddItemField): Promise<TodoItem> {
    const db = this.getDB();
    const newItem = createItemObject(field);

    return new Promise((resolve, reject) => {
      const request = db
        .transaction([columnTitle], MODE.RW)
        .objectStore(columnTitle)
        .add(newItem);

      request.onsuccess = () => resolve(newItem);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  deleteItem(columnTitle: ColumnTitle, key: string): Promise<string> {
    const db = this.getDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction([columnTitle], MODE.RW)
        .objectStore(columnTitle)
        .delete(key);

      request.onsuccess = () => resolve(key);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  updateItem(
    columnTitle: ColumnTitle,
    key: string,
    field: UpdateItemField,
  ): Promise<TodoItem> {
    const db = this.getDB();
    const newItem = createUpdateItemObject(key, field);

    return new Promise((resolve, reject) => {
      const request = db
        .transaction([columnTitle], MODE.RW)
        .objectStore(columnTitle)
        .put(newItem);

      request.onsuccess = () => resolve(newItem);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  getAllColumns(): Promise<TodoColumn[]> {
    const db = this.getDB();
    const columnTitles = Object.values(COLUMN_TITLE);
    const transaction = db.transaction(columnTitles, MODE.R);
    const promises = columnTitles.map((columnTitle) => {
      const objectStore = transaction.objectStore(columnTitle);

      return this.getAllItemsInObjectStore(objectStore);
    });

    return Promise.all(promises) //
      .then((columns) =>
        columns.map((todoList, idx) => ({
          title: columnTitles[idx],
          todoList,
        })),
      );
  }

  getColumn(columnTitle: ColumnTitle): Promise<TodoColumn> {
    const db = this.getDB();
    const transaction = db.transaction([columnTitle], MODE.R);
    const objectStore = transaction.objectStore(columnTitle);

    return this.getAllItemsInObjectStore(objectStore) //
      .then((todoList) => ({
        title: columnTitle,
        todoList,
      }));
  }

  private getAllItemsInObjectStore(
    objectStore: IDBObjectStore,
  ): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      const values: TodoItem[] = [];
      const request = objectStore.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue;

        if (cursor) {
          values.push(cursor.value);
          cursor.continue();
          return;
        }

        resolve(values);
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}
