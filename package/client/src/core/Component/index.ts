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

  wrap(templateArr: string[]) {
    return {
      map(callback: (value: string, i: number, arr: string[]) => string) {
        return templateArr.map(callback).join('');
      },
    };
  }
}
