import type Component from '../Component';

import {
  navigate,
  getPath,
  getQueryParams,
  compareUserPathWithRoutePath,
} from './util';

interface RouteEntry {
  path: string;
  component: Component;
}

export default class Router {
  $routerRoot: HTMLElement;
  table: RouteEntry[] = [];

  constructor($routerRoot: HTMLElement, table: RouteEntry[]) {
    this.$routerRoot = $routerRoot;
    this.table = table;
  }

  navigate(deltaOrUrl: string | number) {
    navigate(deltaOrUrl);
    this.route();
  }

  route() {
    // 현재 경로를 얻어와서
    // 경로에 맞는 컴포넌트를 렌더링한다.
  }
}
