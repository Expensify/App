/**
 * Utility type that excludes `undefined` from the type `TValue`.
 */
type NonUndefined<TValue> = TValue extends undefined ? never : TValue;

export default NonUndefined;
