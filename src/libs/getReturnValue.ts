const getReturnValue = <T, P extends unknown[]>(value: ((...p: P) => T) | T, ...p: P) => (typeof value === 'function' ? (value as (...p: P) => T)(...p) : value);

export default getReturnValue;
