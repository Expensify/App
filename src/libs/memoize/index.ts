/* eslint-disable @typescript-eslint/no-unsafe-return */
import buildArrayCache from './cache/arrayCacheBuilder';
import type {ClientOptions, MemoizeFnPredicate} from './types';
import {mergeOptions} from './utils';

/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param options - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
function memoize<Fn extends MemoizeFnPredicate>(fn: Fn, opts?: ClientOptions) {
    const options = mergeOptions(opts);

    const cache = buildArrayCache<Parameters<Fn>, ReturnType<Fn>>(options);

    const memoized = function memoized(...key: Parameters<Fn>): ReturnType<Fn> {
        const cached = cache.get(key);

        if (cached) {
            return cached.value;
        }

        const result = fn(...key);

        cache.set(key, result as ReturnType<Fn>);

        return result;
    };

    memoized.cache = cache;

    return memoized;
}

export default memoize;
