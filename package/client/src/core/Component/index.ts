import { $, $$, delegateEvent } from './util';

export default abstract class Component<S = unknown, P = unknown> {
  eventListeners = new Set<{
    listener: EventListener;
    eventName: keyof HTMLElementEventMap;
  }>();
  $parent: HTMLElement;
  state?: S;
  props?: P;

  constructor($parent: HTMLElement, props?: P) {
    this.$parent = $parent;
    this.props = props;
    requestAnimationFrame(() => {
      this.mount();
    });
  }

  $<T extends Element>(selector: string) {
    return $<T>(selector, this.$parent);
  }

  $$<T extends Element>(selector: string) {
    return $$<T>(selector, this.$parent);
  }

  setState(newState: S) {
    this.state = newState;
    this.update();
  }

  private _render(): void {
    // const $componentFragment = createComponentElement({
    //   template: this.render(),
    // });
    //
    // const $componentRoot = $componentFragment.children[0] as HTMLElement;
    //
    // this.$componentRoot = $componentRoot;
    // this.$parent.append($componentFragment);
    this.$parent.innerHTML = this.render();
    this.appendChildComponent();
  }

  /**
   * - render에서 세부적인 행동을 정의하지 말고, 리액트처럼 마크업 구조만 반환
   * - DOM조작은 _render 메서드에 위임
   */
  abstract render(): string;

  mount(): void {
    this._render();
    this.setEventListeners();
  }

  update(): void {
    this.removeEventListeners();
    this._render();
    this.setEventListeners();
  }

  unmount(): void {
    this.$parent.innerHTML = '';
    this.removeEventListeners();
  }

  appendChildComponent() {}

  on(
    eventName: keyof HTMLElementEventMap,
    selector: string,
    eventListener: EventListener,
  ) {
    this.eventListeners.add(
      delegateEvent(this.$parent, eventName, selector, eventListener),
    );
  }

  setEventListeners() {}
  removeEventListeners() {
    this.eventListeners.forEach(({ eventName, listener }) => {
      this.$parent.removeEventListener(eventName, listener);
    });
    this.eventListeners.clear();
  }
}

// $parent에 위임한 이벤트는 unmount되거나 $parent가 dom에서 없어지면 사라짐
// document나 window에 등록하는 이벤트는? --> 전용 메서드를 만들어야 할듯??
