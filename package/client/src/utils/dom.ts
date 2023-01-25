export { $, $$ } from '@core/Component/util';
export type BaseNode = DocumentFragment | Document | Element | HTMLElement;

export const classnames = (
  value: string | string[] | Record<string, boolean>,
) => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return Object.entries(value)
    .filter(([, active]) => active)
    .map(([classname]) => classname)
    .join(' ');
};

export const throttle = (fn: (...args: any[]) => void, timeout: number) => {
  let timer: NodeJS.Timer | null = null;

  return (...args: Parameters<typeof fn>) => {
    if (timer) return;

    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, timeout);
  };
};

export const pick = <T, K extends keyof T>(object: T, keys: K[]) =>
  keys.reduce((acc, cur) => {
    acc[cur] = object[cur];
    return acc;
  }, {} as Pick<T, K>);

/**
 * depth1 까지만 비교한다.
 */
export const shallowEqual = <Obj extends Record<string, unknown>>(
  a: Obj,
  b: Obj,
) => Object.entries(a).every(([k, v]) => v === b[k]);

const keyboardFocusableSelectors = [
  'a[href]',
  'button',
  'input',
  'textarea',
  'select',
  'details',
  '[tabindex]:not([tabindex="-1"])',
] as const;

export const getKeyboardFocusableElements = (base: BaseNode = document) =>
  [
    ...base.querySelectorAll(keyboardFocusableSelectors.join(',')),
  ] as HTMLElement[];
