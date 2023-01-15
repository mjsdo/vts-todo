type Theme = 'light' | 'dark';

const localStorageThemeKey = 'theme';
const bodyDataThemeAttr = 'data-theme';

export const initTheme = () => {
  const currentTheme: Theme =
    localStorage.getItem(localStorageThemeKey) ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  document.body.setAttribute(bodyDataThemeAttr, currentTheme);
  localStorage.setItem(localStorageThemeKey, currentTheme);
};

export const setBodyThemeAttr = (theme: Theme) => {
  document.body.setAttribute(bodyDataThemeAttr, theme);
};

export const getBodyThemeAttr = () => {
  const theme = document.body.getAttribute(bodyDataThemeAttr);

  return theme as Theme;
};
