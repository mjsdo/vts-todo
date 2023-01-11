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

export const toggleTheme = () => {
  const nextTheme =
    document.body.getAttribute(bodyDataThemeAttr) === 'dark' ? 'light' : 'dark';

  document.body.setAttribute(bodyDataThemeAttr, nextTheme);
};
