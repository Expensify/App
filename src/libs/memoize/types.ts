type KeyComparator = <K>(key1: K[], key2: K[]) => boolean;

type Cache<K, V> = {
    get: (key: K) => {value: V} | undefined;
    set: (key: K, value: V) => void;
    delete: (key: K) => boolean;
    clear: () => void;
    snapshot: {
        keys: () => K[];
        values: () => V[];
        cache: () => Array<[K, V]>;
        size: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFnPredicate = (...args: any[]) => any;

type MemoizedFn<Fn extends MemoizeFnPredicate> = Fn & {cache: Cache<Parameters<Fn>, ReturnType<Fn>>};

export type {Cache, CacheOpts, Options, ClientOptions, MemoizedFn, KeyComparator, MemoizeFnPredicate};
