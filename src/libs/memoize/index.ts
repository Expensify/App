/* eslint-disable @typescript-eslint/no-unsafe-return */
import type NonPartial from '@src/types/utils/NonPartial';
import type {TakeFirst} from '@src/types/utils/TupleOperations';
import ArrayCache from './cache/ArrayCache';
import {MemoizeStats} from './stats';
import type {Callable, ClientOptions, Constructable, IsomorphicFn, IsomorphicParameters, IsomorphicReturnType, MemoizedFn, Stats} from './types';
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
function memoize<Fn extends IsomorphicFn, MaxArgs extends number = NonPartial<IsomorphicParameters<Fn>>['length'], Key = TakeFirst<IsomorphicParameters<Fn>, MaxArgs>>(
    fn: Fn,
    opts?: ClientOptions<Fn, MaxArgs, Key>,
) {
    const options = mergeOptions<Fn, MaxArgs, Key>(opts);

    const cache = ArrayCache<Key, IsomorphicReturnType<Fn>>({maxSize: options.maxSize, keyComparator: getEqualityComparator(options)});

    const stats = new MemoizeStats(options.monitor || Memoize.isMonitoringEnabled);

    const memoized = function memoized(...args: IsomorphicParameters<Fn>): IsomorphicReturnType<Fn> {
        const statsEntry = stats.createEntry();
        const retrievalTimeStart = performance.now();

        // Detect if memoized function was called with `new` keyword. If so we need to call the original function as constructor.
        const constructable = !!new.target;

        // If keyFilter is set, check if we should skip the cache
        if (options.keyFilter?.(args)) {
            const fnTimeStart = performance.now();
            const result = (constructable ? new (fn as Constructable)(...args) : (fn as Callable)(...args)) as IsomorphicReturnType<Fn>;

            statsEntry.trackTime('processingTime', fnTimeStart);
            statsEntry.track('didHit', false);

            return result;
        }

        const truncatedArgs = truncateArgs(args, options.maxArgs);

        const key = options.transformKey ? options.transformKey(truncatedArgs) : (truncatedArgs as Key);

        const cached = cache.getSet(key, () => {
            const fnTimeStart = performance.now();
            const result = (constructable ? new (fn as Constructable)(...args) : (fn as Callable)(...args)) as IsomorphicReturnType<Fn>;

            // Track processing time
            statsEntry.trackTime('processingTime', fnTimeStart);
            statsEntry.track('didHit', false);

            return result;
        });

        // If processing time was not tracked inside getSet callback, track it as a cache retrieval
        if (statsEntry.get('processingTime') === undefined) {
            statsEntry.trackTime('processingTime', retrievalTimeStart);
            statsEntry.track('didHit', true);
        }

        statsEntry.track('cacheSize', cache.size);
        statsEntry.save();

        return cached.value;
    } as MemoizedFn<Fn, Key>;

    /**
     * Cache API attached to the memoized function. Currently there is an issue with typing cache keys, but the functionality works as expected.
     */
    memoized.cache = cache;

    memoized.startMonitoring = () => stats.startMonitoring();
    memoized.stopMonitoring = () => stats.stopMonitoring();

    Memoize.registerMemoized(options.monitoringName ?? fn.name, memoized);

    return memoized;
}

export default memoize;

export {Memoize};
