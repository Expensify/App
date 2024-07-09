import type {MemoizeStats} from './stats';

type KeyComparator = <K>(key1: K[], key2: K[]) => boolean;

type ValueBox<V> = {value: V};

type Cache<K, V> = {
    get: (key: K) => ValueBox<V> | undefined;
    set: (key: K, value: V) => void;
    /**
     * Get the value for the key if it exists, otherwise set the value to the result of the valueProducer and return it.
     * @param key The key to get or set
     * @param valueProducer The function to produce the value if the key does not exist
     * @returns The value for the key
     */
    getSet: (key: K, valueProducer: () => V) => ValueBox<V>;
    snapshot: {
        keys: () => K[];
        values: () => V[];
        entries: () => Array<[K, V]>;
    };
    size: number;
};

type CacheOpts = {
    maxSize: number;
    keyComparator: KeyComparator;
};

type InternalOptions = {
    cache: 'array';
};

type Options = {
    maxSize: number;
    equality: 'deep' | 'shallow' | KeyComparator;
    monitor: boolean;
    maxArgs?: number;
    monitoringName?: string;
} & InternalOptions;

type ClientOptions = Partial<Omit<Options, keyof InternalOptions>>;

type Stats = Pick<MemoizeStats, 'startMonitoring' | 'stopMonitoring'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFnPredicate = (...args: any[]) => any;

type MemoizedFn<Fn extends MemoizeFnPredicate> = Fn & {cache: Cache<Parameters<Fn>, ReturnType<Fn>>} & Stats;

export type {Cache, CacheOpts, Options, ClientOptions, MemoizedFn, KeyComparator, MemoizeFnPredicate, Stats};
