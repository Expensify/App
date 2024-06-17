import buildArrayCache from './cache/arrayCacheBuilder';
import type {ClientOptions, GenericFn} from './types';
import {mergeOptions} from './utils';

/**
 *
 * @param fn - Function to memoize
 * @param options -
 * @returns
 */
function memoize<Fn extends GenericFn>(fn: Fn, opts?: ClientOptions) {
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
