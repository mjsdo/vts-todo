import '@styles/index.scss';
import Home from '@components/Home';
import Router from '@core/Router';

import { initTheme } from './theme';
import TodoStorage from './TodoStorage';

const $App = document.querySelector('#App') as HTMLDivElement;

initTheme();
const todoStorage = new TodoStorage();

todoStorage.init().then((db) => {
  new Router($App, [
    {
      path: '/',
      matchHandler: () => new Home($App, { db }),
    },
    {
      path: '/log',
      matchHandler: () => new Home($App, { db }),
    },
  ]);
});
