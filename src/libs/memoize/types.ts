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
    cache: 'array';
};

type Options<Fn extends IsomorphicFn, MaxArgs extends number, Key> = {
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
    transformKey?: (truncatedArgs: TakeFirst<IsomorphicParameters<Fn>, MaxArgs>) => Key;
} & InternalOptions;

type ClientOptions<Fn extends IsomorphicFn, MaxArgs extends number, Key> = Partial<Omit<Options<Fn, MaxArgs, Key>, keyof InternalOptions>>;

type Stats = Pick<MemoizeStats, 'startMonitoring' | 'stopMonitoring'>;

type MemoizedFn<Fn extends IsomorphicFn, Key> = Fn & {
    cache: Cache<Key, IsomorphicReturnType<Fn>>;
} & Stats;

export type {Options, ClientOptions, IsomorphicFn, IsomorphicParameters, IsomorphicReturnType, Stats, KeyComparator, MemoizedFn, Callable, Constructable};
