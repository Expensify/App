function callOrReturn<TValue>(value: TValue | (() => TValue)): TValue {
    return typeof value === 'function' ? (value as () => TValue)() : value;
}

export default callOrReturn;
