import type TodoStorage from '@storage/TodoStorage';
import type { TodoColumn, ColumnTitle, TodoItem } from '@storage/type';

import { AddIcon } from '@components/Icons';
import TodoCard from '@components/TodoCard';
import { TAB_INDEX } from '@constants/css';
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

export default class TodoLayer extends Component<State, Props> {
  activeColumn: TodoColumn = { title: 'todo', todoList: [] };
  state: State = {
    todoColumns: [],
    activeColumnTitle: 'todo',
  };

  setEventListeners() {
    const { todoColumns } = this.state;
    const { todoStorage } = this.props;

    if (!todoColumns.length) {
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

      this.setState({
        activeColumnTitle: clickedColumnTitle,
      });
    });
  }

  render() {
    const { todoColumns, activeColumnTitle } = this.state;
    const formatItemCount = (count: number) => (count > 99 ? '99+' : count);
    const CenterAlignedElement = (str: string) =>
      `<div class="text-text absolute" style="transform: translate3d(-50%, -50%, 0); top: 50%; left: 50%;">${str}</div>`;

    if (!todoColumns.length) {
      return CenterAlignedElement('로딩중');
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
                  <button type="button" class="flex items-center gap-6 text-s20 text-text" tabindex="${TAB_INDEX.COLUMN_NAVIGATION}">
                    <strong class="uppercase">${title}</strong>
                    <span class="badge bg-badgeBackground text-s14">${itemCount}</span>
                  </button>
                </li>
              `;
            })}
          </ol>
        </nav>
        <section class="todo-list-layer">
          <ol class="todo-list flex flex-col gap-20 no-scrollbar">
            ${
              !activeColumn.todoList.length
                ? `<div class="self-center my-auto">관리중인 계획이 없습니다.</div>`
                : wrap(activeColumn.todoList).map(
                    () => `<li class="todo-item"></li>`,
                  )
            }
          </ol>
          <div class="todo-add-button-layer">
            <button type="button" class="todo-add-button" tabindex="${
              TAB_INDEX.ADD_TODO_BUTTON
            }" >
              ${AddIcon()}
              <span class="sr-only">Todo Item 카드 추가</span>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  appendChildComponent() {
    const $$todoItem = this.$$<HTMLLIElement>('.todo-item');
    const { activeColumn } = this;
    const todoList = this.sortByWeight(activeColumn.todoList);

    zip($$todoItem, todoList).forEach(([$todoItem, todoItem]) => {
      new TodoCard($todoItem, { todoItem });
    });
  }

  sortByWeight(todoList: TodoItem[]) {
    return [...todoList].sort(
      ({ weight: aWeight }, { weight: bWeight }) => aWeight - bWeight,
    );
  }
}
