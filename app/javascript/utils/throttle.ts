export default function throttle(func: Function, timeout: number) {
  let shouldWait = false;

  // @ts-ignore
  return (...args) => {
    if (shouldWait) return;

    func(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, timeout);
  };
}
