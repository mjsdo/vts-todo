import { navigate, getPath, compareUserPathWithRoutePath } from './util';

export interface RouterContext {
  params: Record<string, string>;
  path: string;
}

interface RouteEntry {
  path: string;
  matchHandler: (context?: RouterContext) => void;
}

interface RouterInterface {
  context: RouterContext;
  navigate: (deltaOrUrl: string | number) => void;
}

export default class Router implements RouterInterface {
  private static routerInstance: Router;

  private readonly $routerRoot: HTMLElement;
  private readonly table: RouteEntry[] = [];
  private readonly anchorElementRouteAttribute = 'route';
  private routerContext!: RouterContext;

  constructor($routerRoot: HTMLElement, table: RouteEntry[]) {
    if (Router.routerInstance) {
      throw new Error('Router 는 여러번 생성할 수 없습니다.');
    }
    Router.routerInstance = this;
    this.$routerRoot = $routerRoot;
    this.table = table;
    this.setEvents();
    this.route();
  }

  get context() {
    return this.routerContext;
  }

  navigate(deltaOrUrl: string | number) {
    navigate(deltaOrUrl);
    this.route();
  }

  static getInstance() {
    if (!Router.routerInstance) {
      throw new Error('생성된 Router 인스턴스가 없습니다.');
    }
    return Router.routerInstance;
  }

  private setEvents() {
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

  private setContext(newContext: RouterContext) {
    this.routerContext = {
      ...this.routerContext,
      ...newContext,
    };
  }

  private route() {
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

      this.setContext({ params, path: userPath });
      this.$routerRoot.innerHTML = '';
      matchHandler(this.context);
    }
  }
}

export const useRouter = () => Router.getInstance();
