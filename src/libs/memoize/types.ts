type KeyComparator = <K>(key1: K[], key2: K[]) => boolean;

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

export type {Cache, CacheOpts, Options, ClientOptions};
