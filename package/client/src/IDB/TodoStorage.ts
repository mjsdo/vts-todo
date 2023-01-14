import type {
  AddItemField,
  ColumnTitle,
  TodoColumn,
  TodoItem,
  UpdateItemField,
} from '@IDB/type';

import IDB from '@IDB/index';
import { COLUMN_TITLE } from '@IDB/type';

const createItemObject = (item: Partial<TodoItem>): TodoItem => ({
  id: crypto.randomUUID(),
  createdAt: new Date(),
  title: 'TITLE',
  body: 'BODY',
  weight: Infinity,
  ...item,
});

export default class TodoStorage {
  private initialized = false;
  private VERSION = 1;
  private db!: IDB; /** this.getDB()로 먼저 체크하기 */
  private dbName = 'todo-storage';

  init(): Promise<this> {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        reject(new Error('DB를 여러번 초기화할 수 없습니다.'));
        return;
      }
      this.initialized = true;

      const request = indexedDB.open(this.dbName, this.VERSION);

      request.onerror = () => {
        this.initialized = false;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = new IDB(request.result);
        resolve(this);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        Object.values(COLUMN_TITLE).forEach((value) => {
          const store = db.createObjectStore(value, {
            keyPath: 'id',
          });

          store.createIndex('weight', 'weight', { unique: true });
        });
      };
    });
  }

  private getDB() {
    if (this.db) return this.db;
    throw new Error('먼저 DB를 초기화 해야합니다.');
  }

  addTodoItem(columnTitle: ColumnTitle, field: AddItemField) {
    const db = this.getDB();
    const newItem = createItemObject(field);

    return db.add(columnTitle, newItem);
  }

  deleteTodoItem(columnTitle: ColumnTitle, key: number) {
    const db = this.getDB();

    return db.delete(columnTitle, key);
  }

  updateTodoItem(
    columnTitle: ColumnTitle,
    key: number,
    field: UpdateItemField,
  ): Promise<TodoItem> {
    const db = this.getDB();

    return db.put(columnTitle, key, field);
  }

  async getAllTodoColumns(): Promise<TodoColumn[]> {
    const db = this.getDB();
    const columnTitles = Object.values(COLUMN_TITLE);
    const columns = await db.getAllFromStores<TodoItem[]>(columnTitles);

    return columns.map((todoList, idx) => ({
      title: columnTitles[idx],
      todoList,
    }));
  }

  async getTodoColumn(columnTitle: ColumnTitle): Promise<TodoColumn> {
    const db = this.getDB();
    const todoList = await db.getAll<TodoItem[]>(columnTitle);

    return {
      title: columnTitle,
      todoList,
    };
  }
}