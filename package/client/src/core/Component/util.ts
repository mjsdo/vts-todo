export type CreateComponentParams = {
  template: string;
};
export type CreateComponent = (
  params: CreateComponentParams,
) => DocumentFragment;

/**
 * 문자열을 DOM 엘리먼트로 변환 후 `DocumentFragment`로 감싸서 반환한다.
 */
export const createComponentElement: CreateComponent = ({ template }) => {
  const container = document.createElement('template');

  container.innerHTML = template;

  if (container.content.children.length > 1) {
    throw new Error('컴포넌트는 하나의 루트 엘리먼트만 가질 수 있습니다.');
  }

  return container.content;
};

export type BaseNode = DocumentFragment | Document | Element | HTMLElement;

export const $ = <T extends Element>(
  selector: string,
  base: BaseNode = document,
) => base.querySelector(selector) as T;

export const $$ = <T extends Element>(
  selector: string,
  base: BaseNode = document,
) => [...base.querySelectorAll(selector)] as T[];

export type DelegateEvent = <
  T extends HTMLElement,
  E extends keyof HTMLElementEventMap,
>(
  target: T,
  eventName: E,
  selector: string,
  handler: (e: HTMLElementEventMap[E]) => void,
) => {
  eventName: E;
  listener: typeof handler;
};

/**
 * - 반환: 위임한 이벤트 정보 `{ eventName: 이벤트, listener: 이벤트리스너 }`
 * - 반환값은 컴포넌트에서 이벤트를 지워야 할 때 사용한다.
 */
export const delegateEvent: DelegateEvent = (
  target,
  eventName,
  selector,
  handler,
) => {
  const _handler: typeof handler = (e) => {
    if (e.target instanceof Element && e.target.closest(selector)) {
      handler(e);
    }
  };

  /**
   * 위임한 요소에 이벤트가 발생했을 때
   * 타겟의 조상에 selector로 쿼리할 수 있는 요소가 있다면
   * 핸들러를 동작시킨다.
   **/
  target.addEventListener(eventName, _handler);
  return {
    eventName,
    listener: _handler,
  };
};

/**
 * ## 커스텀 배열 메서드를 사용하기 위해 배열을 wrap하는 함수.
 *
 * - map: 반환값에 `join('')` 자동 추가
 *
 * ```ts
 *   const state = ['item1', 'item2'];
 *   const template = wrap(state)
 *      .map((item) => `<li>${item}</li>`)
 *
 *   template === `<li>item1</li><li>item2</li>`
 * ```
 */
export const wrap = <T>(templateArr: T[]) => ({
  map(callback: (value: T, i: number, arr: T[]) => string) {
    return templateArr.map(callback).join('');
  },
});
