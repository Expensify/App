/**
 * Creates a proxy around an object variable that can be exported from modules, to allow modification from outside the module.
 * @param value the object that should be wrapped in a proxy
 * @returns A proxy object that can be modified from outside the module
 */
const createProxyForObject = <Value extends Record<string, unknown>>(value: Value) =>
    new Proxy(value, {
        get: (target, property) => {
            if (typeof property === 'symbol') {
                return undefined;
            }

            return target[property];
        },
        set: (target, property, newValue: Value[string]) => {
            if (typeof property === 'symbol') {
                return false;
            }
            // eslint-disable-next-line no-param-reassign
            target[property as keyof Value] = newValue;
            return true;
        },
    });

export default createProxyForObject;
