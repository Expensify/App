/* eslint-disable @typescript-eslint/no-explicit-any */
import type NonPartial from './NonPartial';

/**
 * Fill a tuple with `N` elements from the rest of the tuple.
 */
type FillFromRest<T extends any[], N extends number, O extends any[] = []> = O['length'] extends N
    ? O
    : T extends [infer Head, ...infer Tail]
    ? FillFromRest<Tail, N, [...O, Head]>
    : T extends [...infer Rest]
    ? FillFromRest<Rest, N, [...O, Rest[number]]>
    : O;

// Based on: https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple
/**
 * Split a tuple into two parts: the first `N` elements and the rest.
 */
type TupleSplit<T, N extends number, O extends any[] = []> = O['length'] extends N ? [O, T] : T extends [infer F, ...infer R] ? TupleSplit<[...R], N, [...O, F]> : [O, T];

/**
 * Get the first `N` elements of a tuple. If `N` is not provided, it returns the whole tuple.
 */
type TakeFirst<T extends any[], N extends number = T['length']> = number extends N ? T : TupleSplit<NonPartial<FillFromRest<T, N>>, N>[0];

export type {TupleSplit, TakeFirst};
