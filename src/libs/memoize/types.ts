/**
 * Key is equal to list of arguments passed to memoized function
 */
type Key<K> = K[];

type KeyComparator = <K>(key1: Key<K>, key2: Key<K>) => boolean;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFn = (...args: any[]) => any;

/**
 * Checks wheter keys are equal
 * @param key1
 * @param key2
 */
// declare function isEqual<K>(key1: Key<K>, key2: Key<K>);

type Cache<K, V> = {
    has: (key: K) => boolean;
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    delete: (key: K) => void;
    clear: () => void;
    snapshot: {
        keys: () => K[];
        values: () => V[];
        cache: () => Array<[K, V]>;
    };
};

type CacheOpts = {
    maxSize: number;
    equality: 'deep' | 'shallow' | KeyComparator;
};

type InternalOptions = {
    cache: 'array';
};

type Options = {
    maxSize: number;
    equality: 'deep' | 'shallow' | KeyComparator;
    monitor: boolean;
} & InternalOptions;

type ClientOptions = Partial<Omit<Options, keyof InternalOptions>>;

export type {Cache, CacheOpts, Key, KeyComparator, GenericFn, Options, ClientOptions};
