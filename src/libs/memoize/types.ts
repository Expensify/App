type MapCacheConfig = {
    cacheMode: 'map';
    equalityCheck: 'deep';
};

type ArrayCacheConfig = {
    cacheMode: 'array';
    equalityCheck: 'shallow' | 'deep';
};

type CacheConfig = MapCacheConfig | ArrayCacheConfig;

type MemoizeConfig = {
    maxSize?: number;
} & CacheConfig;

type CacheKey = any;

type MemoizeStaticInstance<T> = {
    get: (key: CacheKey) => T | undefined;
    set: (key: CacheKey, value: T) => void;
    clear: () => void;
};

type MemoizeInstance<Fn extends () => unknown> = Fn & MemoizeStaticInstance<ReturnType<Fn>>;

type Memoize = <Fn extends () => unknown>(f: Fn, config: MemoizeConfig) => MemoizeInstance<Fn>;

export type {Memoize, MemoizeConfig, MemoizeInstance};
