import type TodoStorage from '@storage/TodoStorage';
import type { TodoColumn, ColumnTitle } from '@storage/type';

import Component from '@core/Component';
import { wrap } from '@core/Component/util';
import { classnames as cn } from '@utils/dom';

export interface State {
  todoColumns: TodoColumn[];
  activeColumnTitle: ColumnTitle;
}

export interface Props {
  todoStorage: TodoStorage;
}

export default class TodoLayer extends Component<State, Props> {
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

    if (!todoColumns.length) {
      return `
         <div>로딩중...</div>
      `;
    }

    const activeColumn = todoColumns.find(
      ({ title }) => title === activeColumnTitle,
    );

    return `
      <div class="bg-background text-text">
        <nav id="todo-layer-nav" class="mb-24">
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
        <section id="todo-layer-main">
          ${activeColumn && wrap(activeColumn.todoList)}
        </section>
      </div>
    `;
  }

  appendChildComponent() {
    const $todoLayerMain = this.$('#todo-layer-main') as HTMLDivElement;
  }
}
