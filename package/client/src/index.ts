import '@styles/index.scss';
import Home from '@components/Home';
import Router from '@core/Router';
import TodoStorage from '@storage/TodoStorage';

import { initTheme } from './theme';

const $App = document.querySelector('#App') as HTMLDivElement;

initTheme();
const todoStorage = new TodoStorage();

todoStorage.init().then(() => {
  new Router($App, [
    {
      path: '/',
      matchHandler: () => new Home($App, { todoStorage }),
    },
    {
      path: '/log',
      matchHandler: () => new Home($App, { todoStorage }),
    },
  ]);
});
