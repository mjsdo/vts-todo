import '@styles/index.scss';
import Home from '@components/Home';
import Router from '@core/Router';
import IDB from '@IDB/index';

import { initTheme } from './theme';

const $App = document.querySelector('#App') as HTMLDivElement;

initTheme();
const db = new IDB('todo');

db.init().then(() => {
  new Router($App, [
    {
      path: '/',
      matchHandler: () => new Home($App, { db }),
    },
    {
      path: '/activities',
      matchHandler: () => new Home($App, { db }),
    },
  ]);
});
