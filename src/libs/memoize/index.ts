/* eslint-disable @typescript-eslint/no-unsafe-return */
import type {Constructor} from 'type-fest';
import type {TakeFirst} from '@src/types/utils/TupleOperations';
import ArrayCache from './cache/ArrayCache';
import {MemoizeStats} from './stats';
import type {ClientOptions, MemoizedFn, MemoizeFnPredicate, Stats} from './types';
import {getEqualityComparator, mergeOptions, truncateArgs} from './utils';

/**
 * Global memoization class. Use it to orchestrate memoization (e.g. start/stop global monitoring).
 */
class Memoize {
    static isMonitoringEnabled = false;

    private static memoizedList: Array<{id: string; memoized: Stats}> = [];

    static registerMemoized(id: string, memoized: Stats) {
        this.memoizedList.push({id, memoized});
    }

    static startMonitoring() {
        if (this.isMonitoringEnabled) {
            return;
        }
        this.isMonitoringEnabled = true;
        Memoize.memoizedList.forEach(({memoized}) => {
            memoized.startMonitoring();
        });
    }

    static stopMonitoring() {
        if (!this.isMonitoringEnabled) {
            return;
        }
        this.isMonitoringEnabled = false;
        return Memoize.memoizedList.map(({id, memoized}) => ({id, stats: memoized.stopMonitoring()}));
    }
}

/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param opts - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
function memoize<Fn extends MemoizeFnPredicate, MaxArgs extends number = Parameters<Fn>['length'], Key = TakeFirst<Parameters<Fn>, MaxArgs>>(fn: Fn, opts?: ClientOptions<Fn, MaxArgs, Key>) {
    const options = mergeOptions<Fn, MaxArgs, Key>(opts);

    const cache = ArrayCache<Key, ReturnType<Fn>>({maxSize: options.maxSize, keyComparator: getEqualityComparator(options)});

    const stats = new MemoizeStats(options.monitor || Memoize.isMonitoringEnabled);

    const memoized = function memoized(...args: Parameters<Fn>): ReturnType<Fn> {
        const constructable = !!new.target;

        const truncatedArgs = truncateArgs(args, options.maxArgs);

        const key = options.transformKey ? options.transformKey(truncatedArgs) : (truncatedArgs as Key);

        const statsEntry = stats.createEntry();
        statsEntry.track('didHit', true);

        const retrievalTimeStart = performance.now();
        const cached = cache.getSet(key, () => {
            const fnTimeStart = performance.now();
            // If the function is constructable, we need to call it with the `new` keyword
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result = constructable ? new (fn as unknown as Constructor<ReturnType<Fn>, Parameters<Fn>>)(...args) : fn(...args);
            statsEntry.trackTime('fnTime', fnTimeStart);
            statsEntry.track('didHit', false);

            return result;
        });
        // Subtract the time it took to run the function from the total retrieval time
        statsEntry.trackTime('cacheRetrievalTime', retrievalTimeStart + (statsEntry.get('fnTime') ?? 0));

        statsEntry.track('cacheSize', cache.size);
        statsEntry.save();

        return cached.value;
    };

    /**
     * Cache API attached to the memoized function. Currently there is an issue with typing cache keys, but the functionality works as expected.
     */
    memoized.cache = cache;

    memoized.startMonitoring = () => stats.startMonitoring();
    memoized.stopMonitoring = () => stats.stopMonitoring();

    Memoize.registerMemoized(options.monitoringName ?? fn.name, memoized);

    return memoized as MemoizedFn<Fn, Key>;
}

export default memoize;

export {Memoize};
