type Func<T extends unknown[], R> = (...args: T) => R;

function callOrReturn<TArgs extends unknown[], TReturn>(value: TReturn | Func<TArgs, TReturn>, ...args: TArgs): TReturn {
    if (typeof value === 'function') {
        return (value as Func<TArgs, TReturn>)(...args);
    }

    return value;
}

export default callOrReturn;
