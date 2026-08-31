import type NonPartial from '@src/types/utils/NonPartial';
import type TakeFirst from '@src/types/utils/TupleOperations';

import {shallowEqual} from 'fast-equals';
import lodashIsPlainObject from 'lodash/isPlainObject';

import type {Callable, ClientOptions, Constructable, IsomorphicFn, IsomorphicParameters, IsomorphicReturnType, MemoizedFn, Stats} from './types';

import ArrayCache from './cache/ArrayCache';
import MemoizeStats from './stats';
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
        for (const {memoized} of Memoize.memoizedList) {
            memoized.startMonitoring();
        }
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

        // If skipCache is set, check if we should skip the cache
        if (options.skipCache?.(args)) {
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

/** Narrowed to plain objects only: `Object.keys` describes nothing about a Set, Map, Date or class instance. */
const isPlainObject = (value: unknown): value is Record<string, unknown> => lodashIsPlainObject(value);

/**
 * Two arguments are equivalent when they are shallowly equal, or are plain objects whose values are shallowly equal -
 * the second level covers arguments rebuilt from unchanged sources (e.g. a mapped Onyx collection).
 */
const areArgumentsEquivalent = (previousArgument: unknown, nextArgument: unknown) => {
    if (shallowEqual(previousArgument, nextArgument)) {
        return true;
    }
    if (!isPlainObject(previousArgument) || !isPlainObject(nextArgument)) {
        return false;
    }
    const previousKeys = Object.keys(previousArgument);
    if (previousKeys.length !== Object.keys(nextArgument).length) {
        return false;
    }
    return previousKeys.every((key) => key in nextArgument && shallowEqual(previousArgument[key], nextArgument[key]));
};

/**
 * Compares memoization keys argument by argument. Use it for functions taking large arguments that are rebuilt on every
 * call from unchanged sources, where `'shallow'` always misses and `'deep'` would walk the whole payload.
 */
const equivalentArgsComparator = <Key extends readonly unknown[]>(previousArgs: Key, nextArgs: Key) =>
    previousArgs.length === nextArgs.length && previousArgs.every((argument, index) => areArgumentsEquivalent(argument, nextArgs[index]));

export default memoize;
export {equivalentArgsComparator};
