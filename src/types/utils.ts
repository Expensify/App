/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable import/prefer-default-export */
type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

export type {DeepValueOf};
