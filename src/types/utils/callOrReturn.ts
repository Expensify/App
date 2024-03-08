type Func<T extends unknown[], R> = (...args: T) => R;

function callOrReturn<T extends unknown[], R>(value: R | Func<T, R>, ...args: T): R {
    if (typeof value === 'function') {
        return (value as Func<T, R>)(...args);
    }
    return value;
}

export default callOrReturn;
