/** indexed DB */
export const COLUMN_TITLE = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export interface TodoItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  weight: number;
}

export interface TodoColumn {
  title: keyof typeof COLUMN_TITLE;
  todoList: TodoItem[];
}

export default class DB {
  private initialized = false;
  private VERSION = 1;
  db: IDBDatabase | undefined;
  dbName = '';

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        reject('DB를 여러번 초기화할 수 없습니다.');
      }

      this.initialized = true;

      const request = indexedDB.open(this.dbName, this.VERSION);

      request.addEventListener('error', (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      });

      request.addEventListener('success', (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
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
}
