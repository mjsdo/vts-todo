type Theme = 'light' | 'dark';

const localStorageThemeKey = 'theme';
const bodyDataThemeAttr = 'data-theme';

const loadTheme = () => localStorage.getItem(localStorageThemeKey) as Theme;
const saveTheme = (theme: Theme) =>
  localStorage.setItem(localStorageThemeKey, theme);

export const initTheme = () => {
  const currentTheme: Theme =
    loadTheme() ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');

  document.body.setAttribute(bodyDataThemeAttr, currentTheme);
  saveTheme(currentTheme);
};

export const setBodyThemeAttr = (theme: Theme) => {
  document.body.setAttribute(bodyDataThemeAttr, theme);
  saveTheme(theme);
};

export const getBodyThemeAttr = () => {
  const theme = document.body.getAttribute(bodyDataThemeAttr);

  return theme as Theme;
};
