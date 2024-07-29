import type {TakeFirst} from '@src/types/utils/TupleOperations';
import type {Cache} from './cache/types';
import type {MemoizeStats} from './stats';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFnPredicate = (...args: any[]) => any;

type KeyComparator<Key> = (k1: Key, k2: Key) => boolean;

type InternalOptions = {
    cache: 'array';
};

type Options<Fn extends MemoizeFnPredicate, MaxArgs extends number, Key> = {
    maxSize: number;
    equality: 'deep' | 'shallow' | KeyComparator<Key>;
    monitor: boolean;
    maxArgs?: MaxArgs;
    monitoringName?: string;
    /**
     * Function to transform the arguments into a key, which is used to reference the result in the cache.
     * When called with constructable (e.g. class, `new` keyword) functions, it won't get proper types for `truncatedArgs`
     * Any viable fixes are welcome!
     * @param truncatedArgs - Tuple of arguments passed to the memoized function (truncated to `maxArgs`). Does not work with constructable (see description).
     * @returns - Key to use for caching
     */
    transformKey?: (truncatedArgs: TakeFirst<Parameters<Fn>, MaxArgs>) => Key;
} & InternalOptions;

type ClientOptions<Fn extends MemoizeFnPredicate, MaxArgs extends number, Key> = Partial<Omit<Options<Fn, MaxArgs, Key>, keyof InternalOptions>>;

type Stats = Pick<MemoizeStats, 'startMonitoring' | 'stopMonitoring'>;

type MemoizedFn<Fn extends MemoizeFnPredicate, Key> = Fn & {
    cache: Cache<Key, ReturnType<Fn>>;
} & Stats;

export type {Options, ClientOptions, MemoizeFnPredicate, Stats, KeyComparator, MemoizedFn};
