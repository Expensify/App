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
        const cached = cache.get(key);

        // If cached value is there, return it
        if (cached) {
            statsEntry.registerStat('didHit', true);
            statsEntry.registerStat('processingTime', performance.now() - retrievalTimeStart);

            statsEntry.save();

            return cached.value;
        }

        // If no cached value, calculate it and store it
        statsEntry.registerStat('didHit', false);
        const fnTimeStart = performance.now();
        const result = fn(...key);
        statsEntry.registerStat('processingTime', performance.now() - fnTimeStart);

        cache.set(key, result as ReturnType<Fn>);

        statsEntry.save();

        return result;
    };

    memoized.cache = cache;

    memoized.stats = {
        startMonitoring: () => stats.startMonitoring(),
        stopMonitoring: () => stats.stopMonitoring(),
    };

    return memoized;
}

export default memoize;
