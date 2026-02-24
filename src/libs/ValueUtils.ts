const getReturnValue = <T, P extends unknown[]>(value: ((...p: P) => T) | T, ...p: P) => (typeof value === 'function' ? (value as (...p: P) => T)(...p) : value);
const getFirstValue = <T>(value: T | [T]) => (Array.isArray(value) ? value[0] : value);

export {getReturnValue, getFirstValue};
