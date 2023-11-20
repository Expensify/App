function callOrReturn<T>(value: T | (() => T)): T {
    return typeof value === 'function' ? (value as () => T)() : value;
}

export default callOrReturn;
