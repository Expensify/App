type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

// eslint-disable-next-line import/prefer-default-export
export type {DeepValueOf};
