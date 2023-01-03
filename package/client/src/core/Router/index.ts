import type Component from '../Component';

import { navigate, getPath, compareUserPathWithRoutePath } from './util';

interface RouterContext {
  params?: Record<string, string>;
}

interface RouteEntry {
  path: string;
  matchHandler: (context?: RouterContext) => Component;
}

export default class Router {
  $routerRoot: HTMLElement;
  table: RouteEntry[] = [];
  anchorElementRouteAttribute = 'route';

  constructor($routerRoot: HTMLElement, table: RouteEntry[]) {
    this.$routerRoot = $routerRoot;
    this.table = table;
    this.setEvents();
  }

  setEvents() {
    /** 새로고침 */
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        this.route();
      },
      {
        once: true,
      },
    );

    /** 링크 클릭 (a태그에 route 어트리뷰트가 있는 경우에만) */
    this.$routerRoot.addEventListener('click', (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        const $origin = e.target.closest(
          `a[${this.anchorElementRouteAttribute}]`,
        );

        if (!$origin) return;

        e.preventDefault();

        const url = $origin.getAttribute('href');

        if (url) this.navigate(url);
      }
    });

    /** 뒤로가기와 앞으로가기 */
    window.addEventListener('popstate', () => {
      this.route();
    });
  }

  navigate(deltaOrUrl: string | number) {
    navigate(deltaOrUrl);
    this.route();
  }

  route() {
    // 현재 경로를 얻어와서
    // 경로에 맞는 컴포넌트를 렌더링한다.
    const userPath = getPath();

    for (const { path: routePath, matchHandler } of this.table) {
      const { valid, params } = compareUserPathWithRoutePath(
        userPath,
        routePath,
      );

      if (!valid) {
        continue;
      }

      this.$routerRoot.innerHTML = '';
      matchHandler({ params });
    }
  }
}
