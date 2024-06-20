/* eslint-disable @typescript-eslint/no-unsafe-return */
import buildArrayCache from './cache/arrayCacheBuilder';
import {MemoizeStats} from './stats';
import type {ClientOptions, MemoizedFn, MemoizeFnPredicate, Stats} from './types';
import {mergeOptions} from './utils';

/**
 * Global memoization class. Use it to orchestrate memoization (e.g. start/stop global monitoring).
 */
class Memoize {
    static monitoringEnabled = false;

    private static memoizedList: Array<{id: string; memoized: Stats}> = [];

    static registerMemoized(id: string, memoized: Stats) {
        this.memoizedList.push({id, memoized});
    }

    static startMonitoring() {
        if (this.monitoringEnabled) {
            return;
        }
        this.monitoringEnabled = true;
        Memoize.memoizedList.forEach(({memoized}) => {
            memoized.startMonitoring();
        });
    }

    static stopMonitoring() {
        if (!this.monitoringEnabled) {
            return;
        }
        this.monitoringEnabled = false;
        return Memoize.memoizedList.map(({id, memoized}) => ({id, stats: memoized.stopMonitoring()}));
    }
}

/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param options - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
function memoize<Fn extends MemoizeFnPredicate>(fn: Fn, opts?: ClientOptions): MemoizedFn<Fn> {
    const options = mergeOptions(opts);

    const cache = buildArrayCache<Parameters<Fn>, ReturnType<Fn>>(options);

    const stats = new MemoizeStats(options.monitor || Memoize.monitoringEnabled);

    const memoized = function memoized(...key: Parameters<Fn>): ReturnType<Fn> {
        const statsEntry = stats.createEntry();
        statsEntry.track('keyLength', key.length);

        const retrievalTimeStart = performance.now();
        let cached = cache.get(key);
        statsEntry.track('cacheRetrievalTime', performance.now() - retrievalTimeStart);
        statsEntry.track('didHit', !!cached);

        if (!cached) {
            const fnTimeStart = performance.now();
            const result = fn(...key);
            statsEntry.track('fnTime', performance.now() - fnTimeStart);

            cached = {value: result};
            cache.set(key, result as ReturnType<Fn>);
        }

        statsEntry.track('cacheSize', cache.size);
        statsEntry.save();

        return cached.value;
    };

    memoized.cache = cache;

    memoized.startMonitoring = () => stats.startMonitoring();
    memoized.stopMonitoring = () => stats.stopMonitoring();

    Memoize.registerMemoized(options.monitoringName ?? fn.name, memoized);

    return memoized as MemoizedFn<Fn>;
}

export default memoize;

export {Memoize};
