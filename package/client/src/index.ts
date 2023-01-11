import '@styles/index.scss';
import Home from '@components/Home';
import Router from '@core/Router';

import { initTheme } from './theme';

const $App = document.querySelector('#App') as HTMLDivElement;

initTheme();

new Router($App, [
  {
    path: '/',
    matchHandler: () => new Home($App, {}),
  },
  {
    path: '/activities',
    matchHandler: () => new Home($App, {}),
  },
]);
