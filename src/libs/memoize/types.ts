import type {TakeFirst} from '@src/types/utils/TupleOperations';
import type {Cache} from './cache/types';
import type {MemoizeStats} from './stats';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callable = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructable = new (...args: any[]) => any;

type IsomorphicFn = Callable | Constructable;

type IsomorphicParameters<Fn extends IsomorphicFn> = Fn extends Callable ? Parameters<Fn> : Fn extends Constructable ? ConstructorParameters<Fn> : never;

type IsomorphicReturnType<Fn extends IsomorphicFn> = Fn extends Callable ? ReturnType<Fn> : Fn extends Constructable ? Fn : never;

type KeyComparator<Key> = (k1: Key, k2: Key) => boolean;

type InternalOptions = {
    /**
     * Type of cache to use. Currently only `array` is supported.
     */
    cache: 'array';
};

type Options<Fn extends IsomorphicFn, MaxArgs extends number, Key> = {
    /**
     * Maximum number of entries in the cache. If the cache exceeds this number, the oldest entries will be removed.
     */
    maxSize: number;
    /**
     * Equality comparator to use for comparing keys in the cache. Can be either:
     * - `deep` - default comparator that uses [DeepEqual](https://github.com/planttheidea/fast-equals?tab=readme-ov-file#deepequal)
     * - `shallow` - comparator that uses [ShallowEqual](https://github.com/planttheidea/fast-equals?tab=readme-ov-file#shallowequal)
     * - a custom comparator - a function that takes two keys and returns a boolean.
     */
    equality: 'deep' | 'shallow' | KeyComparator<Key>;
    /**
     * If set to `true`, memoized function stats will be collected. It can be overridden by global `Memoize` config. See `MemoizeStats` for more information.
     */
    monitor: boolean;
    /**
     * Maximum number of arguments to use for caching. If set, only the first `maxArgs` arguments will be used to generate the cache key.
     */
    maxArgs?: MaxArgs;
    /**
     * Name of the monitoring entry. If not provided, the function name will be used.
     */
    monitoringName?: string;
    /**
     * Transforms arguments into a cache key. If set, `maxArgs` will be applied to arguments first.
     * @param truncatedArgs Tuple of arguments passed to the memoized function (truncated to `maxArgs`). Does not work with constructable (see description).
     * @returns Key to use for caching
     */
    transformKey?: (truncatedArgs: TakeFirst<IsomorphicParameters<Fn>, MaxArgs>) => Key;

    /**
     * Checks if the cache should be skipped for the given arguments.
     * @param args Tuple of arguments passed to the memoized function. Does not work with constructable (see description).
     * @returns boolean to whether to skip cache lookup and execute the function if true
     */
    keyFilter?: (args: IsomorphicParameters<Fn>) => boolean;
} & InternalOptions;

type ClientOptions<Fn extends IsomorphicFn, MaxArgs extends number, Key> = Partial<Omit<Options<Fn, MaxArgs, Key>, keyof InternalOptions>>;

type Stats = Pick<MemoizeStats, 'startMonitoring' | 'stopMonitoring'>;

type MemoizedFn<Fn extends IsomorphicFn, Key> = Fn & {
    cache: Cache<Key, IsomorphicReturnType<Fn>>;
} & Stats;

export type {Options, ClientOptions, IsomorphicFn, IsomorphicParameters, IsomorphicReturnType, Stats, KeyComparator, MemoizedFn, Callable, Constructable};
