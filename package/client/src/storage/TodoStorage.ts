import type {
  TodoItemField,
  ColumnTitle,
  TodoColumn,
  TodoItem,
  UpdateItemField,
} from '@storage/type';

import { uuid } from '@core/Component/util';
import IDB from '@IDB/index';
import { COLUMN_TITLE } from '@storage/type';

const createItemObject = (item: TodoItemField) => {
  const date = new Date();

  return {
    ...item,
    id: uuid(),
    createdAt: date,
    updatedAt: date,
  };
};

const createUpdateItemObject = (item: UpdateItemField) => {
  const date = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt: deleted, ...withoutCreatedAt } = item; // createdAt은 처음 값을 유지해야 하니 제거

  return {
    ...withoutCreatedAt,
    updatedAt: date,
  };
};

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

  addTodoItem(columnTitle: ColumnTitle, field: TodoItemField) {
    const db = this.getDB();
    const newItem = createItemObject(field);

    return db.add(columnTitle, newItem);
  }

  deleteTodoItem(columnTitle: ColumnTitle, key: string) {
    const db = this.getDB();

    return db.delete(columnTitle, key);
  }

  updateTodoItem(
    columnTitle: ColumnTitle,
    field: UpdateItemField,
  ): Promise<TodoItem> {
    const db = this.getDB();
    const newItem = createUpdateItemObject(field);

    return db.put<TodoItem>(columnTitle, newItem.id, newItem);
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
