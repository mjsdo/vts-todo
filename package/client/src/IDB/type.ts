export type ColumnTitle = 'todo' | 'doing' | 'done';

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
  updatedAt: Date;
  weight: number;
}

export type TodoItemField = Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateItemField = TodoItem;

export interface TodoColumn {
  title: ColumnTitle;
  todoList: TodoItem[];
}
