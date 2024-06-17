import buildArrayCache from './cache/arrayCacheBuilder';
import type {Cache, ClientOptions} from './types';
import {mergeOptions} from './utils';

/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param options - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function memoize<Fn extends (...args: any[]) => any>(fn: Fn, opts?: ClientOptions): Fn & {cache: Cache<Parameters<Fn>, ReturnType<Fn>>} {
    const options = mergeOptions(opts);

    const cache = buildArrayCache<Parameters<Fn>, ReturnType<Fn>>(options);

    const memoized = function memoized(...args: Parameters<Fn>): ReturnType<Fn> {
        const key = args;
        const cached = cache.get(key);

        if (cached) {
            return cached;
        }

        const result = fn(...args);

        cache.set(key, result);

        return result;
    };

    memoized.cache = cache;

    return memoized;
}

export default memoize;
