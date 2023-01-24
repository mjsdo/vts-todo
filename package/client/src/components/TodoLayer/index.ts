import type TodoStorage from '@storage/TodoStorage';
import type { TodoColumn, ColumnTitle, TodoItem } from '@storage/type';

import { AddIcon } from '@components/Icons';
import Loader from '@components/Loader';
import TodoCard from '@components/TodoCard';
import DRAG_KEY from '@constants/dragKey';
import Component from '@core/Component';
import { wrap } from '@core/Component/util';
import { zip } from '@utils/array';
import { classnames as cn } from '@utils/dom';

import './styles.scss';

export interface State {
  todoColumns: TodoColumn[];
  activeColumnTitle: ColumnTitle;
}

export interface Props {
  todoStorage: TodoStorage;
}

const initialTodoAddItem = {
  id: '',
  body: '',
  title: '',
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const INITIAL_WEIGHT = 101;

export default class TodoLayer extends Component<State, Props> {
  state: State = {
    todoColumns: [],
    activeColumnTitle: 'todo',
  };
  activeColumn: TodoColumn = { title: 'todo', todoList: [] };
  dropHandlerSettled = true;

  effect() {
    const { todoColumns: _todoColumns } = this.state;
    const { todoStorage } = this.props;

    if (!_todoColumns.length) {
      todoStorage.getAllTodoColumns().then((latestTodoColumns) => {
        this.setState({
          todoColumns: latestTodoColumns,
          activeColumnTitle: latestTodoColumns[0].title,
        });
      });
    }

    /* handleClickNavItem */
    this.on('click', '[data-column-title]', (e) => {
      const $navItem = (e.target as HTMLElement).closest(
        '[data-column-title]',
      ) as HTMLLIElement;
      const clickedColumnTitle = $navItem.dataset.columnTitle as ColumnTitle;

      this.setState({ activeColumnTitle: clickedColumnTitle });
    });

    /* handleClickAddTodoButton */
    this.on('click', '.todo-add-button', (e) => {
      const $todoAddForm = this.$<HTMLDivElement>('.todo-add-form');

      if (!$todoAddForm.childElementCount && e.target) {
        new TodoCard(
          $todoAddForm,
          {
            todoItem: initialTodoAddItem,
            handleAddTodo: this.handleAddTodo.bind(this),
          },
          { mode: 'create' },
        );
      }
    });

    this.on('dragover', '[data-column-title]', (e) => {
      e.preventDefault();
    });

    /* 다른 컬럼으로 아이템 이동 */
    /* handleDropTodoOtherColumn */
    this.on('drop', '[data-column-title]', (e) => {
      this.dropHandler(async () => {
        const targetItemId = e.dataTransfer?.getData(
          DRAG_KEY.TODO_ITEM_ID,
        ) as string;

        const $columnTitle = (e.target as HTMLElement).closest(
          '[data-column-title]',
        ) as HTMLElement;

        if (!$columnTitle || !targetItemId) return;
        const columnTitle = $columnTitle.dataset.columnTitle as ColumnTitle;

        const { activeColumnTitle } = this.state;

        if (columnTitle === activeColumnTitle) return;

        // (from, to, itemId)
        await this.handleDropTodoOtherColumn(
          activeColumnTitle,
          columnTitle,
          targetItemId,
        );
      });
    });
  }

  render() {
    const { todoColumns, activeColumnTitle } = this.state;
    const formatItemCount = (count: number) => (count > 99 ? '99+' : count);
    const CenterAlignedElement = (str: string) =>
      `<div class="text-text absolute" style="transform: translate3d(-50%, -50%, 0); top: 50%; left: 50%;">${str}</div>`;

    if (!todoColumns.length) {
      return CenterAlignedElement(Loader());
    }

    const activeColumn = todoColumns.find(
      ({ title }) => title === activeColumnTitle,
    );

    if (!activeColumn) {
      return CenterAlignedElement('DB를 불러오는데 실패했습니다.');
    }

    this.activeColumn = activeColumn;

    return `
      <div class="bg-background text-text">
        <nav class="todo-column-tabs">
          <ol class="flex gap-30 justify-center">
            ${wrap(todoColumns).map(({ title, todoList }) => {
              const itemCount = formatItemCount(todoList.length);
              const itemOpacityCn = cn({
                'opacity-30': title !== activeColumnTitle,
              });

              return `
                <li class="${itemOpacityCn}" data-column-title="${title}">
                  <button type="button" class="flex items-center gap-6 text-s20 text-text">
                    <strong class="uppercase">${title}</strong>
                    <span class="badge bg-badgeBackground text-s14">${itemCount}</span>
                  </button>
                </li>
              `;
            })}
          </ol>
        </nav>
        <section class="todo-list-layer">
          <div class="todo-add-button-layer">
            <button type="button" class="todo-add-button">
              ${AddIcon()}
              <span class="sr-only">Todo Item 카드 추가</span>
            </button>
          </div>
          <ol class="todo-list flex flex-col gap-20 no-scrollbar">
            <div class="todo-add-form"></div>
            ${
              !activeColumn.todoList.length
                ? `<div class="self-center my-auto">관리중인 계획이 없습니다.</div>`
                : wrap(activeColumn.todoList).map(
                    () => `<li class="todo-item"></li>`,
                  )
            }
          </ol>
        </section>
      </div>
    `;
  }

  appendChildComponent() {
    const $$todoItem = this.$$<HTMLLIElement>('.todo-item');
    const { activeColumn } = this;

    this.sortByWeightMutation(activeColumn.todoList);
    const handleEditTodo = this.handleEditTodo.bind(this);
    const handleDeleteTodo = this.handleDeleteTodo.bind(this);
    const handleDropTodoSameColumn = this.handleDropTodoSameColumn.bind(this);

    zip($$todoItem, activeColumn.todoList).forEach(([$todoItem, todoItem]) => {
      new TodoCard($todoItem, {
        todoItem,
        handleEditTodo,
        handleDeleteTodo,
        handleDropTodoSameColumn,
      });
    });
  }

  sortByWeight(todoList: TodoItem[]) {
    return [...todoList].sort(
      ({ weight: aWeight }, { weight: bWeight }) => aWeight - bWeight,
    );
  }

  sortByWeightMutation(todoList: TodoItem[]) {
    return todoList.sort(
      ({ weight: aWeight }, { weight: bWeight }) => aWeight - bWeight,
    );
  }

  getMinWeight(todoList: TodoItem[]) {
    const minWeight = todoList.reduce(
      (acc, { weight }) => Math.min(acc, weight),
      Infinity,
    );

    return minWeight === Infinity ? INITIAL_WEIGHT : minWeight;
  }

  dropHandler(fn: () => void) {
    try {
      if (!this.dropHandlerSettled) return;
      this.dropHandlerSettled = false;

      fn();
    } catch (error) {
      this.errorHandler(error);
    } finally {
      this.dropHandlerSettled = true;
    }
  }

  async handleDropTodoSameColumn(
    fromItem: TodoItem,
    toItem: TodoItem,
    direction: 'up' | 'down',
  ) {
    this.dropHandler(() => {});
  }

  async handleDropTodoOtherColumn(
    fromColumnTitle: ColumnTitle,
    toColumnTitle: ColumnTitle,
    itemId: string,
  ) {
    const { todoColumns } = this.state;
    const { todoStorage } = this.props;

    const targetItem = todoColumns
      .find(({ title }) => fromColumnTitle === title)
      ?.todoList?.find(({ id }) => itemId === id) as TodoItem;
    const minWeight = this.getMinWeight(
      todoColumns.find(({ title }) => toColumnTitle === title)
        ?.todoList as TodoItem[],
    );

    todoStorage
      .moveTodoItem(fromColumnTitle, toColumnTitle, {
        ...targetItem,
        weight: minWeight - 1,
      })
      .then(({ fromColumn, toColumn }) => {
        this.setState({
          todoColumns: todoColumns.map((c) => {
            if (c.title === fromColumnTitle) return fromColumn;
            if (c.title === toColumnTitle) return toColumn;
            return c;
          }),
        });
      })
      .catch((error) => {
        this.errorHandler(error, '데이터 이동에 실패했습니다.');
      });
  }

  async handleAddTodo(inputs: Pick<TodoItem, 'title' | 'body'>) {
    const { todoStorage } = this.props;
    const newState = { ...this.state };
    const columnTitle = newState.activeColumnTitle;
    const _todoList = newState.todoColumns.find(
      ({ title }) => title === columnTitle,
    )?.todoList as TodoItem[];

    const minWeight = this.getMinWeight(_todoList);
    const userInputsWithWeight = { ...inputs, weight: minWeight - 1 };

    todoStorage
      .addTodoItem(columnTitle, userInputsWithWeight)
      .then((newTodoItem) => {
        newState.todoColumns = newState.todoColumns.map((column) => {
          const { title, todoList } = column;

          if (title !== columnTitle) return column;

          return { ...column, todoList: [newTodoItem, ...todoList] };
        });
        this.setState(newState);
      })
      .catch((error) => {
        this.errorHandler(error, '데이터 추가에 실패했습니다.');
      });
  }

  async handleEditTodo(inputs: TodoItem) {
    const { todoStorage } = this.props;
    const newState = { ...this.state };
    const columnTitle = newState.activeColumnTitle;

    todoStorage
      .updateTodoItem(columnTitle, inputs)
      .then((editedItem) => {
        newState.todoColumns = newState.todoColumns.map((column) => {
          const { title, todoList } = column;

          if (title !== columnTitle) return column;

          return {
            ...column,
            todoList: todoList.map((todoItem) =>
              todoItem.id !== editedItem.id ? todoItem : editedItem,
            ),
          };
        });
        this.setState(newState);
      })
      .catch((error) => {
        this.errorHandler(error, '데이터 수정에 실패했습니다.');
      });
  }

  async handleDeleteTodo(key: string) {
    const { todoStorage } = this.props;
    const newState = { ...this.state };
    const columnTitle = newState.activeColumnTitle;

    todoStorage
      .deleteTodoItem(columnTitle, key)
      .then((deletedItemKey) => {
        newState.todoColumns = newState.todoColumns.map((column) => {
          const { title, todoList } = column;

          if (title !== columnTitle) return column;

          return {
            ...column,
            todoList: todoList.filter(({ id }) => id !== deletedItemKey),
          };
        });
        this.setState(newState);
      })
      .catch((error) => {
        this.errorHandler(error, '데이터 삭제에 실패했습니다.');
      });
  }

  errorHandler(error: unknown, alertMessage = '') {
    if (error instanceof Error) {
      console.error(error.message);
      alertMessage ? alert(alertMessage) : alert(error.message);
    }
  }
}
