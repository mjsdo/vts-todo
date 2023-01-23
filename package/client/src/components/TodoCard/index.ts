import type { ColumnTitle, TodoItem } from '@storage/type';

import { DeleteIcon, EditIcon } from '@components/Icons';
import Component from '@core/Component';
import { formatDateToKRLocaleString } from '@utils/date';
import { pick, shallowEqual, throttle } from '@utils/dom';

import './styles.scss';

export type TodoItemInputValues = Pick<TodoItem, 'title' | 'body'>;

export interface Props {
  todoItem: TodoItem;
  handleAddTodo?: (todoItem: TodoItemInputValues) => void;
  handleEditTodo?: (todoItem: TodoItem) => void;
}

export interface State {
  mode: 'create' | 'edit' | 'read';
}

const MAX_TITLE_LENGTH = 60;
const MAX_BODY_LENGTH = 600;

export default class TodoCard extends Component<State, Props> {
  beforeMount() {
    this.state.mode = this.state.mode ?? 'read';
  }

  effect() {
    const { mode } = this.state;

    /* handleClickEditButton */
    this.on('click', '.todo-edit-button', () => {
      this.setState({ mode: 'edit' });
    });

    if (mode !== 'read') {
      this.$<HTMLInputElement>('.todo-item-title-field').focus();

      /* handleClickFormCancelButton */
      this.on('click', '.todo-form-cancel-button', () => {
        if (mode === 'create') {
          this.unmount();
          return;
        }

        this.setState({ mode: 'read' });
      });

      /* handleClickFormSubmitButton */
      this.on('click', '.todo-form-submit-button', () => {
        const inputValues = {
          title: (this.$('.todo-item-title-field') as HTMLInputElement).value,
          body: (this.$('.todo-item-body-field') as HTMLTextAreaElement).value,
        };

        if (this.isShallowEqualTo(inputValues)) {
          alert(`이전 값과 동일하여 양식 제출에 실패했습니다.`);
        }

        if (!this.validateInputLength(inputValues)) {
          alert(
            `제목은 ${MAX_TITLE_LENGTH}자 이하, 본문은 ${MAX_BODY_LENGTH}이하만 가능합니다.`,
          );
          return;
        }

        if (mode === 'create') {
          const { handleAddTodo } = this.props;

          if (!handleAddTodo) throw new Error('handleAddTodo 메서드 누락');
          handleAddTodo(inputValues);

          return;
        }

        if (mode === 'edit') {
          const { handleEditTodo, todoItem } = this.props;

          if (!handleEditTodo) throw new Error('handleEditTodo 메서드 누락');
          handleEditTodo({
            ...todoItem,
            ...inputValues,
          });
        }
      });

      /* handleFormInput */
      this.on(
        'input',
        '.todo-item-field',
        throttle(() => {
          const $submitButton = this.$<HTMLButtonElement>(
            '.todo-form-submit-button',
          );

          const inputValues = {
            title: (this.$('.todo-item-title-field') as HTMLInputElement).value,
            body: (this.$('.todo-item-body-field') as HTMLTextAreaElement)
              .value,
          };

          $submitButton.disabled = this.isShallowEqualTo(inputValues);
        }, 50),
      );
    }
  }

  render() {
    const {
      todoItem: { id, title, body, createdAt },
    } = this.props;

    const { mode } = this.state;
    const isEditOrCreateMode = ['edit', 'create'].includes(mode);

    return `
      <div class="todo-card bg-card rounded-xl p-16 shadow border border-solid border-transparent relative">
        ${
          isEditOrCreateMode
            ? `
        <header class="mb-6 text-s16 font-bold">
          <input 
            placeholder="제목을 입력하세요" 
            class="todo-item-field todo-item-title-field" 
            type="text" 
            maxlength="${MAX_TITLE_LENGTH}"
            value="${title}"
          />
        </header>
        <div class="mb-8 text-s14">
          <textarea 
            placeholder="본문을 입력하세요" 
            class="todo-item-field todo-item-body-field" 
            rows="5"
            maxlength="${MAX_BODY_LENGTH}"
          >${body}</textarea>
        </div>
        <div class="flex gap-10 pt-8">
          <button class="todo-form-cancel-button button button-cancel grow" type="button">취소</button>
          <button class="todo-form-submit-button button button-accent grow" type="button" disabled>확인</button>
        </div>`
            : `
        <header class="mb-8 text-s16 font-bold">
          <strong>${title}</strong> 
        </header>
        <div class="mb-8 text-s14">
          <p>${body}</p>
        </div>
        <div class="text-s12 text-footer">
          <time>${formatDateToKRLocaleString(createdAt)}</time>
        </div>
        <div class="flex absolute right-12 top-8">
          ${CardIconButton(() => EditIcon(), 'todo-edit-button', '수정하기')}
          ${CardIconButton(
            () => DeleteIcon(),
            'todo-delete-button',
            '삭제하기',
          )}
        </div>`
        }
      </div>`;
  }

  isShallowEqualTo(inputValues: TodoItemInputValues) {
    const fields = pick(this.props.todoItem, ['title', 'body']); // 초깃값

    return shallowEqual(fields, inputValues);
  }

  validateInputLength(inputValues: TodoItemInputValues) {
    const { title, body } = inputValues;

    return title.length <= MAX_TITLE_LENGTH && body.length <= MAX_BODY_LENGTH;
  }
}

const CardIconButton = (
  render: (...params: never[]) => string,
  cn = '',
  srOnlyText = '',
) => `
  <button type="button" class="flex items-center justify-center text-text text-s16 py-4 px-6 ${cn}">
    ${render()}
    <span class="sr-only">${srOnlyText}</span>
  </button>
`;
