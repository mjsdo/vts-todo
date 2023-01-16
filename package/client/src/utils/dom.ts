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
