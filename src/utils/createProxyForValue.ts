const createProxyForValue = <Value, VariableName extends string>(value: Record<VariableName, Value>, variableName: VariableName) =>
    new Proxy(value, {
        get: (target, prop) => {
            if (prop !== variableName) {
                return undefined;
            }
            return target[prop as VariableName];
        },
        set: (target, prop, newValue) => {
            if (prop !== variableName) {
                return false;
            }
            // eslint-disable-next-line no-param-reassign
            target[prop as VariableName] = newValue;
            return true;
        },
    });

export default createProxyForValue;
