export type ColumnTitle = 'todo' | 'doing' | 'done';

export interface TodoItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  weight: number;
}

export type AddItemField = Omit<TodoItem, 'id' | 'createdAt'>;
export type UpdateItemField = TodoItem;

export interface TodoColumn {
  title: ColumnTitle;
  todoList: TodoItem[];
}
