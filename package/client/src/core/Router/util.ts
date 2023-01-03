export const navigate = (deltaOrUrl: string | number) => {
  if (typeof deltaOrUrl === 'string') {
    window.history.pushState({}, '', deltaOrUrl);
    return;
  }
  window.history.go(deltaOrUrl);
};

export const getPath = () => window.location.pathname;

/**
 * - 쿼리 파라미터를 { key : value } 형태로 반환한다.
 * - 동일한 key가 여러번 나오면 마지막으로 사용된 key의 value가 반환된다.
 */
export const getQueryParams = () => {
  const { search } = window.location;
  const urlSearchParams = new URLSearchParams(search);

  return Object.fromEntries([...urlSearchParams]);
};

export const zip = <T, K>(arr1: T[], arr2: K[]): [T, K][] => {
  if (arr1.length !== arr2.length)
    throw new Error('두 배열의 길이가 같아야 합니다.');

  return Array(arr1.length)
    .fill(undefined)
    .map((_, idx) => [arr1[idx], arr2[idx]]);
};

export type CompareResult<
  T extends Record<string, string> = Record<string, string>,
> =
  | {
      valid: true;
      params: T;
    }
  | {
      valid: false;
      params: undefined;
    };

export type CompareUserPathWithRoutePath<
  T extends Record<string, string> = Record<string, string>,
> = (path: string, routePath: string) => CompareResult<T>;
/**
 * @param userPath 사용자가 접속한 path
 * @param routePath 라우팅 테이블에 존재하는 path
 */
export const compareUserPathWithRoutePath: CompareUserPathWithRoutePath = (
  userPath,
  routePath,
) => {
  const invalidResult = { valid: false, params: undefined } as const;

  const userPathTokens = userPath.split('/');
  const routePathTokens = routePath.split('/');

  if (userPathTokens.length !== routePathTokens.length) {
    return invalidResult;
  }

  const potentialRouteParams = zip(routePathTokens, userPathTokens).filter(
    ([routePathToken, pathToken]) => routePathToken !== pathToken,
  );

  const params: Record<string, string> = {};

  for (const [key, value] of potentialRouteParams) {
    if (!key.startsWith(':')) {
      return invalidResult;
    }
    params[key.slice(1)] = value;
  }

  const validResult = {
    valid: true,
    params,
  } as const;

  return validResult;
};
