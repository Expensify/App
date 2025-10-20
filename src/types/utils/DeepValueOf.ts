// eslint-disable-next-line @typescript-eslint/no-restricted-types
type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

export default DeepValueOf;
