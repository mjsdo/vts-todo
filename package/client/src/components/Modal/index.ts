import Component from '@core/Component';
import modalStore from '@stores/modalStore';
import { getKeyboardFocusableElements } from '@utils/dom';

import './styles.scss';

export interface Props {
  dimmedColor?: string;
}

export interface State {}

/* 여러 모달이 중첩해서 열리는 경우엔 Stack으로? */
let windowFocusHandler: (e: FocusEvent) => void;
const renewWindowFocusHandler = (handler: typeof windowFocusHandler) => {
  if (windowFocusHandler) {
    window.removeEventListener('focus', windowFocusHandler);
  }
  window.addEventListener('focus', (windowFocusHandler = handler));
};

export default class Modal extends Component<State, Props> {
  render() {
    const { open } = modalStore.state;
    const { dimmedColor = 'rgba(0, 0, 0, 0.6)' } = this.props;

    return !open
      ? ``
      : `
      <div class="modal-layer absolute left-0 right-0 top-0 bottom-0">
        <div class="modal-dimmed w-screen h-screen" style="background-color: ${dimmedColor}"></div>
        <div class="modal-content" tabindex="-1"></div>
      </div>
    `;
  }

  appendChildComponent() {
    const { open, content } = modalStore.state;

    if (!open) return;

    const $modalContent = this.$<HTMLElement>('.modal-content');

    content?.($modalContent);
    /* 모달이 열리면 다음 Tab키의 시작점을 바꾸기 위해 모달 내부의 tabindex가 -1인 요소를 focus한다 */
    $modalContent.focus();

    /* viewport 바깥으로 (ex: devtools) 포커스 했다가 다시 Tab 키로 들어오는 경우 */
    renewWindowFocusHandler(() => {
      this.$<HTMLElement>('.modal-content')?.focus();
    });
  }

  effect() {
    /* handlePressTab (KeyDown) */
    this.on('keydown', '.modal-content', (e) => {
      if (e.key !== 'Tab') return;

      const $modalLayer = this.$<HTMLElement>('.modal-layer');
      const $fakeFocusable = this.$('.modal-content'); // tabindex가 -1인 요소
      const $$focusable = getKeyboardFocusableElements($modalLayer);
      const isFirstFocusable = (_e: Event) =>
        _e.target === $fakeFocusable || _e.target === $$focusable.at(0);

      /* 모달을 닫기 전까지 Tab키로 Focus가능한 범위를 모달 내부의 Focusable 요소로 가둔다. */
      if (e.target === $$focusable.at(-1)) {
        e.preventDefault();
        $$focusable.at(0)?.focus();
        return;
      }

      if (isFirstFocusable(e) && e.shiftKey) {
        e.preventDefault();
        $$focusable.at(-1)?.focus();
      }
    });

    /* handlePressEscape (KeyUp) */
    this.on('keyup', 'body', (e) => {
      e.key === 'Escape' && modalStore.reset();
    });

    /* handleClickDimmedLayer */
    this.on('click', '.modal-dimmed', () => {
      modalStore.reset();
    });
  }
}
