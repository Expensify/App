// eslint-disable-next-line @typescript-eslint/ban-types
type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

export default DeepValueOf;
