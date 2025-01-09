interface HasId {
  id: string;
}

export default function indexRecordsById<T extends HasId>(
  arr: T[]
): Map<string, T> {
  const m = new Map();
  arr.forEach((e) => {
    m.set(e.id, e);
  });
  return m;
}
