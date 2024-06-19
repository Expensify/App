/* eslint-disable @typescript-eslint/no-unsafe-return */
import buildArrayCache from './cache/arrayCacheBuilder';
import {MemoizeStats} from './stats';
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

    const stats = new MemoizeStats(options.monitor);

    const memoized = function memoized(...key: Parameters<Fn>): ReturnType<Fn> {
        const statsEntry = stats.createEntry();
        statsEntry.registerStat('keyLength', key.length);

        const retrievalTimeStart = performance.now();
        let cached = cache.get(key);
        statsEntry.registerStat('cacheRetrievalTime', performance.now() - retrievalTimeStart);
        statsEntry.registerStat('didHit', !!cached);

        if (!cached) {
            const fnTimeStart = performance.now();
            const result = fn(...key);
            statsEntry.registerStat('fnTime', performance.now() - fnTimeStart);

            cached = {value: result};
            cache.set(key, result as ReturnType<Fn>);
        }

        statsEntry.save();

        return cached.value;
    };

    memoized.cache = cache;

    memoized.stats = {
        startMonitoring: () => stats.startMonitoring(),
        stopMonitoring: () => stats.stopMonitoring(),
    };

    return memoized;
}

export default memoize;
