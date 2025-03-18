type CacheConfig<K> = {
    maxSize: number;
    keyComparator: (k1: K, k2: K) => boolean;
};

type BoxedValue<V> = {value: V};

type Cache<K, V> = {
    get: (key: K) => BoxedValue<V> | undefined;
    set: (key: K, value: V) => void;
    /**
     * Get the value for the key if it exists, otherwise set the value to the result of the valueProducer and return it.
     * @param key The key to get or set
     * @param valueProducer The function to produce the value if the key does not exist
     * @returns The value for the key
     */
    getSet: (key: K, valueProducer: () => V) => BoxedValue<V>;
    snapshot: {
        keys: () => K[];
        values: () => V[];
        entries: () => Array<[K, V]>;
    };
    size: number;
};

export type {CacheConfig, Cache, BoxedValue};
