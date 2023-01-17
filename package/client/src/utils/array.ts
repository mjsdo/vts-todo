// eslint-disable-next-line import/prefer-default-export
export const zip = <V1 = unknown, V2 = unknown>(
  a: V1[],
  b: V2[],
): [V1, V2][] => {
  const aLen = a.length;
  const bLen = b.length;

  return aLen >= bLen ? a.map((v, i) => [v, b[i]]) : b.map((v, i) => [a[i], v]);
};
