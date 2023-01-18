// eslint-disable-next-line import/prefer-default-export
export const formatDateToKRLocaleString = (date: Date) =>
  new Intl.DateTimeFormat('ko-KR').format(date).replace(/\s/g, '');
