type Constructor<T> = new (...args: unknown[]) => T;

export function PartialType<T>(
  classRef: Constructor<T>,
): Constructor<Partial<T>> {
  return classRef;
}
