const createProxyForValue = <Value extends Record<string, unknown>>(value: Value) =>
    new Proxy(value, {
        get: (target, property) => {
            if (typeof property === 'symbol') {
                return undefined;
            }

            return target[property];
        },
        set: (target, property, newValue) => {
            if (typeof property === 'symbol') {
                return false;
            }
            // eslint-disable-next-line no-param-reassign
            target[property as keyof Value] = newValue;
            return true;
        },
    });

export default createProxyForValue;
