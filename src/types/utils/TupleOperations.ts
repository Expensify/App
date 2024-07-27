/* eslint-disable @typescript-eslint/no-explicit-any */

// Based on: https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple
type TupleSplit<T, N extends number, O extends readonly any[] = readonly []> = O['length'] extends N
    ? [O, T]
    : T extends readonly [infer F, ...infer R]
    ? TupleSplit<readonly [...R], N, readonly [...O, F]>
    : [O, T];

type TakeFirst<T extends readonly any[], N extends number = T['length']> = TupleSplit<T, N>[0];

export type {TupleSplit, TakeFirst};
