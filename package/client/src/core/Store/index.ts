import type { ComponentInstance } from '@core/Component';

export default class Store<S> {
  private readonly initialState: S;
  private observers = new Map<string, ComponentInstance>();
  state: S;

  constructor(initialState: S) {
    this.initialState = initialState;
    this.state = initialState;
  }

  reset() {
    this.setState(this.initialState);
  }

  setState(updater: S | ((prevState: S) => S)) {
    // typeof updater === 'function'사용시 'S & Function' has no call signatures 오류
    // https://github.com/microsoft/TypeScript/issues/37663
    this.state = updater instanceof Function ? updater(this.state) : updater;
    this.notifyAll();
  }

  subscribe(key: string, component: ComponentInstance) {
    const realKey = `${component.constructor.name}-${key}`;

    this.observers.set(realKey, component);
  }

  unSubscribe(key: string) {
    this.observers.delete(key);
  }

  private notifyAll() {
    this.observers.forEach((component) => {
      component.update();
    });
    this.collectGarbage();
  }

  private collectGarbage() {
    this.observers.forEach((component, key) => {
      if (!component.existsInDOM()) {
        this.unSubscribe(key);
      }
    });
  }
}
