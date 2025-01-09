export default function compareArrays<T>(
  arr1: T[] | undefined,
  arr2: T[] | undefined
): boolean {
  if (arr1 === undefined && arr2 === undefined) return true;
  if (arr1 !== undefined && arr2 === undefined) return false;
  if (arr1 === undefined && arr2 !== undefined) return false;
  if (arr1!.length !== arr2!.length) return false;
  return arr1!.every((e) => arr2!.includes(e));
}
