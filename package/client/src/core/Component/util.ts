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
