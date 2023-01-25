import type { TodoItem } from '@storage/type';

import AlertBox from '@components/AlertBox';
import { DeleteIcon, EditIcon } from '@components/Icons';
import DRAG_KEY from '@constants/dragKey';
import Component from '@core/Component';
import { wrap } from '@core/Component/util';
import modalStore from '@stores/modalStore';
import { formatDateToKRLocaleString } from '@utils/date';
import { pick, shallowEqual, throttle } from '@utils/dom';

import './styles.scss';

export type TodoItemInputValues = Pick<TodoItem, 'title' | 'body'>;

export interface Props {
  todoItem: TodoItem;
  handleAddTodo?: (todoItem: TodoItemInputValues) => void;
  handleEditTodo?: (todoItem: TodoItem) => void;
  handleDeleteTodo?: (itemKey: string) => void;
  handleDropTodoSameColumn?: (
    fromItem: string,
    toItem: string,
    direction: 'up' | 'down',
  ) => void;
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
            `제목은 1~${MAX_TITLE_LENGTH}자, 본문은 1~${MAX_BODY_LENGTH}자만 가능합니다.`,
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

    /* handleClickDeleteButton */
    this.on('click', '.todo-delete-button', () => {
      const { handleDeleteTodo, todoItem } = this.props;

      if (!handleDeleteTodo) throw new Error('handleDeleteTodo 메서드 누락');

      const handleCancel = () => modalStore.reset();
      const handleSubmit = () => {
        handleDeleteTodo(todoItem.id);
        modalStore.reset();
      };

      modalStore.setState({
        open: true,
        content: ($parent: HTMLElement) =>
          new AlertBox($parent, {
            message: '정말로 삭제하시겠습니까?',
            handleCancel,
            handleSubmit,
          }),
      });
    });

    /* handleCardDragStart */
    this.on('dragstart', '.todo-card', (e) => {
      const $card = (e.target as HTMLElement).closest('.todo-card');

      if (!$card) return;

      e.dataTransfer?.setData(DRAG_KEY.TODO_ITEM_ID, this.props.todoItem.id);
      $card.classList.add('dragging');
    });

    /* handleCardDragEnd */
    this.on('dragend', '.todo-card', (e) => {
      const $card = (e.target as HTMLElement).closest('.todo-card');

      if (!$card) return;
      $card.classList.remove('dragging');
    });

    /* handleDragOverCard */
    this.on('dragover', '.todo-card', (e) => {
      e.preventDefault();
    });

    /* handleDropToCard */
    this.on('drop', '.todo-card', (e) => {
      const $toCard = (e.target as HTMLElement).closest(
        '.todo-card',
      ) as HTMLElement;
      const toCardId = this.props.todoItem.id;
      const fromCardId = e.dataTransfer!.getData(
        DRAG_KEY.TODO_ITEM_ID,
      ) as string;

      if (toCardId === fromCardId) return;

      const { handleDropTodoSameColumn } = this.props;

      if (!handleDropTodoSameColumn)
        throw new Error('handleDropTodoSameColumn 메서드 누락');

      const { y, height } = $toCard.getBoundingClientRect();
      const midY = y + height / 2;
      const { clientY } = e;

      const direction = clientY < midY ? 'up' : 'down';

      handleDropTodoSameColumn(fromCardId, toCardId, direction);
    });
  }

  render() {
    const {
      todoItem: { title, body, createdAt },
    } = this.props;

    const { mode } = this.state;
    const isEditOrCreateMode = ['edit', 'create'].includes(mode);
    const draggable = mode === 'read';

    return `
      <div class="todo-card bg-card rounded-xl p-16 shadow border border-solid border-transparent relative" draggable="${draggable}">
        ${
          isEditOrCreateMode
            ? `
        <header class="mb-6 text-s18 font-bold">
          <input 
            placeholder="제목을 입력하세요" 
            class="todo-item-field todo-item-title-field" 
            type="text" 
            maxlength="${MAX_TITLE_LENGTH}"
            value="${title}"
            spellcheck="false"
          />
        </header>
        <div class="mb-8 text-s14">
          <textarea 
            placeholder="본문을 입력하세요" 
            class="todo-item-field todo-item-body-field" 
            rows="5"
            maxlength="${MAX_BODY_LENGTH}"
            spellcheck="false"
          >${body}</textarea>
        </div>
        <div class="flex gap-10 pt-8">
          <button class="todo-form-cancel-button button button-cancel grow" type="button">취소</button>
          <button class="todo-form-submit-button button button-accent grow" type="button" disabled>확인</button>
        </div>`
            : `
        <header class="mb-8 text-s18 font-bold overflow-x-auto flex">
          <strong class="pr-60 break-all">${title}</strong> 
        </header>
        <div class="mb-8 text-s14">
          ${wrap(body.split('\n')).map(this.toHTMLString)}
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
    let { title, body } = inputValues;

    title = title.trim();
    body = body.trim();

    return (
      title.length &&
      title.length <= MAX_TITLE_LENGTH &&
      body.length &&
      body.length <= MAX_BODY_LENGTH
    );
  }

  toHTMLString(row: string) {
    return row === `` ? `<p><br /></p>` : `<p>${row}</p>`;
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
