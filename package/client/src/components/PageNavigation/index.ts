import { HistoryIcon, TodoListIcon } from '@components/Icons';
import Component from '@core/Component';
import { wrap } from '@core/Component/util';
import { useRouter } from '@core/Router';
import { classnames as cn } from '@utils/dom';

const pages = [
  {
    name: 'home',
    href: '/',
    component: TodoListIcon,
  },
  {
    name: 'log',
    href: '/log',
    component: HistoryIcon,
  },
];

export default class PageNavigation extends Component {
  render() {
    const { path } = useRouter().context;

    return `
      <ul class="flex bg-card text-text max-w-600 w-600">
        ${wrap(pages).map(({ href, component, name }) => {
          const liCn = cn({
            'border-accent': href === path,
            'border-transparent': href !== path,
          });

          return `
            <li class="w-1-2 border-t-4 border-solid ${liCn} trs-border-color">
              <a route href="${href}" class="w-full h-48 flex items-center justify-center">
                ${component()}
                <span class="sr-only">${name}</span>
              </a>
            </li>
          `;
        })}
      </ul>
    `;
  }
}
