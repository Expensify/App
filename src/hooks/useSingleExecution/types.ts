type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

export default Action;
