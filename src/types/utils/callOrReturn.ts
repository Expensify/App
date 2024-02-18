function callOrReturn<TValue>(value: TValue | (() => TValue)): TValue {
    if (typeof value === 'function') {
        return (value as () => TValue)();
    }

    return value;
}

export default callOrReturn;
