import type { TodoItem } from '@storage/type';

import { DeleteIcon, UpdateIcon } from '@components/Icons';
import Component from '@core/Component';
import { formatDateToKRLocale } from '@utils/date';

export interface Props {
  todoItem: TodoItem;
}

export interface State {
  editMode?: boolean;
}

export default class TodoCard extends Component<State, Props> {
  render() {
    const {
      todoItem: { id, title, body, createdAt },
    } = this.props;

    const { editMode } = this.state;

    return `
      <div class="bg-card rounded-xl p-16 shadow border border-solid border-transparent relative">
        <header class="mb-8 text-s16 font-bold">
          ${editMode
            ? `<input 
                 placeholder="제목을 입력하세요" 
                 class="todo-item-title-field" 
                 type="text" 
                 maxlength="40" 
              />`
            : `<strong>${title}</strong>`
          }
        </header>
        <div class="mb-8 text-s14">
          ${editMode
            ? `<textarea 
                 placeholder="본문을 입력하세요" 
                 class="todo-item-body-field" 
                 rows="1"
               ></textarea>`
            : `<p>${body}</p>`
          }
        </div>
        ${editMode
          ? `<div class="flex gap-10 pt-8">
               <button class="button button-cancel grow" type="button">취소</button>
               <button class="button button-accent grow" type="button">확인</button>
             </div>`
          : `<div class="text-s12 text-footer">
               <time>${formatDateToKRLocale(createdAt)}</time>
             </div>
            <div class="flex absolute right-12 top-8">
              <button type="button" class="flex items-center justify-center text-text text-s16 py-4 px-6">
                ${UpdateIcon()}
                <span class="sr-only">수정하기</span>
              </button>
              <button type="button" class="flex items-center justify-center text-text text-s16 py-4 px-6">
                ${DeleteIcon()}
                <span class="sr-only">삭제하기</span>
              </button>
            </div>`
        }
      </div>
    `;
  }
}
