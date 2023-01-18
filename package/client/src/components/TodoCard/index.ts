import type { TodoItem } from '@storage/type';

import { DeleteIcon, EditIcon } from '@components/Icons';
import Component from '@core/Component';
import { formatDateToKRLocaleString } from '@utils/date';
import { pick, shallowEqual, throttle } from '@utils/dom';

import './styles.scss';

export interface Props {
  todoItem: TodoItem;
}

export interface State {
  mode: 'create' | 'edit' | 'read';
}

export default class TodoCard extends Component<State, Props> {
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
        this.setState({ mode: 'read' });
      });

      /* handleClickFormSubmitButton */
      this.on('click', '.todo-form-submit-button', () => {
        if (mode === 'create') {
          console.log('생성');
          return;
        }

        if (mode === 'edit') {
          console.log('수정');
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
          const fields = pick(this.props.todoItem, ['title', 'body']); // 초깃값
          const inputValues = {
            title: (this.$('.todo-item-title-field') as HTMLInputElement).value,
            body: (this.$('.todo-item-body-field') as HTMLTextAreaElement)
              .value,
          };

          $submitButton.disabled = shallowEqual(fields, inputValues);
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
            maxlength="40"
            value="${title}"
          />
        </header>
        <div class="mb-8 text-s14">
          <textarea 
            placeholder="본문을 입력하세요" 
            class="todo-item-field todo-item-body-field" 
            rows="5"
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
