import { $, $$, delegateEvent, uuid } from './util';

interface ComponentEventListener {
  eventName: keyof HTMLElementEventMap;
  listener: EventListener;
}

export default abstract class Component<
  S = Record<string, never>,
  P = Record<string, never>,
> {
  private readonly id = uuid();
  eventListeners: ComponentEventListener[] = [];
  $parent: HTMLElement;
  state: S;
  props: P;

  constructor($parent: HTMLElement, props = {} as P, state = {} as S) {
    this.$parent = $parent;
    this.state = state;
    this.props = props;
    requestAnimationFrame(() => {
      this.beforeMount();
      this.mount();
    });
  }

  existsInDOM() {
    return document.body.contains(this.$parent);
  }

  protected $<T extends Element>(selector: string) {
    return $<T>(selector, this.$parent);
  }

  protected $$<T extends Element>(selector: string) {
    return $$<T>(selector, this.$parent);
  }

  setState(partialState: Partial<S>) {
    const prevState = { ...this.state } as Record<string, unknown>;

    const isChanged = Object.entries(partialState).some(
      ([k, v]) => prevState[k] !== v,
    );

    if (isChanged) {
      this.state = {
        ...this.state,
        ...partialState,
      };
      requestAnimationFrame(() => this.update());
    }
  }

  private _render(): void {
    this.$parent.innerHTML = this.render();
    this.appendChildComponent();
  }

  abstract render(): string;

  mount(): void {
    this._render();
    this.effect();
  }

  update(): void {
    this.removeEventListeners();
    this.cleanup();
    this._render();
    this.effect();
  }

  beforeMount() {}

  unmount(): void {
    this.$parent.innerHTML = '';
    this.removeEventListeners();
    this.cleanup();
  }

  appendChildComponent() {}

  on<E extends keyof HTMLElementEventMap>(
    eventName: E,
    selector: string,
    eventListener: (e: HTMLElementEventMap[E]) => void,
  ) {
    this.eventListeners.push({
      eventName,
      listener: delegateEvent(
        this.$parent,
        eventName,
        selector,
        eventListener,
      ) as EventListener,
    });
  }

  /**
   * ????????? ??????, ????????? ????????? DOM ??????
   */
  effect() {}
  cleanup() {}

  /**
   * this.on ?????? ????????? ??????????????? ??? ??????????????? ?????? ????????????
   */
  private removeEventListeners() {
    this.eventListeners.forEach(({ eventName, listener }) => {
      this.$parent.removeEventListener(eventName, listener);
    });
    this.eventListeners.length = 0;
  }
}

export type ComponentInstance = InstanceType<typeof Component>;
