type CacheMode = 'array' | 'map';

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
    maxSize: number;
} & CacheConfig;

type ExternalMemoizeConfig = Partial<MemoizeConfig>;

type CacheBuilder = <Fn extends () => unknown, C extends MemoizeConfig>(f: Fn, config: C) => MemoizedInterface<Fn>;

type MemoizedInterface<Fn extends () => unknown, Key = Parameters<Fn>, Val = ReturnType<Fn>> = Fn & {
    get: (key: Key) => Val | undefined;
    set: (key: Key, value: Val) => void;
    clear: () => void;
    snapshot: () => Array<[Key, Val]>;
};

export type {MemoizeConfig, ExternalMemoizeConfig, CacheMode, MemoizedInterface, CacheBuilder};
