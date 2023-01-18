export { $, $$ } from '@core/Component/util';

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

export const throttle = <P extends unknown[]>(fn: (...args: P) => void, timeout: number) => {
  let timer: NodeJS.Timer | null = null;

  return (...args: Parameters<typeof fn>) => {
    if (timer) return;

    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, timeout);
  };
};
