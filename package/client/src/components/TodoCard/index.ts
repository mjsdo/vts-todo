import type { TodoItem } from '@storage/type';

import { DeleteIcon, EditIcon } from '@components/Icons';
import Component from '@core/Component';
import { formatDateToKRLocale } from '@utils/date';

import './styles.scss';

export interface Props {
  todoItem: TodoItem;
}

export interface State {
  editMode?: boolean;
}

export default class TodoCard extends Component<State, Props> {
  setEventListeners() {

  }

  render() {
    const {
      todoItem: { id, title, body, createdAt },
    } = this.props;

    const { editMode } = this.state;

    return `
      <div class="todo-card bg-card rounded-xl p-16 shadow border border-solid border-transparent relative">
        ${
          editMode
            ? `
        <header class="mb-8 text-s16 font-bold">
          <input 
            placeholder="제목을 입력하세요" 
            class="todo-item-title-field" 
            type="text" 
            maxlength="40" 
          />
        </header>
        <div class="mb-8 text-s14">
          <textarea 
            placeholder="본문을 입력하세요" 
            class="todo-item-body-field" 
            rows="1"
          ></textarea>
        </div>
        <div class="flex gap-10 pt-8">
          <button class="button button-cancel grow" type="button">취소</button>
          <button class="button button-accent grow" type="button">확인</button>
        </div>`
            : `
        <header class="mb-8 text-s16 font-bold">
          <strong>${title}</strong> 
        </header>
        <div class="mb-8 text-s14">
          <p>${body}</p>
        </div>
        <div class="text-s12 text-footer">
          <time>${formatDateToKRLocale(createdAt)}</time>
        </div>
        <div class="flex absolute right-12 top-8">
          ${CardIconButton(() => EditIcon(), 'todo-edit-button', '수정하기')}
          ${CardIconButton(() => DeleteIcon(), 'todo-delete-button', '삭제하기')}
        </div>`
        }
      </div>`;
  }
}

const CardIconButton = (render: (...params: never[]) => string, cn = '', srOnlyText = '') => `
  <button type="button" class="flex items-center justify-center text-text text-s16 py-4 px-6 ${cn}">
    ${render()}
    <span class="sr-only">${srOnlyText}</span>
  </button>
`;
