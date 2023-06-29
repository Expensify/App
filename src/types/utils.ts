type NestedValues<T> = T extends object ? NestedValues<T[keyof T]> : T;

// eslint-disable-next-line import/prefer-default-export
export type {NestedValues};
