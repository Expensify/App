/**
 * Internal cache structure type.
 * - `array` - it operates on an array, which enables both `shallow` and `deep` comparison of keys. Check `ArrayCacheConfig` for more details.
 * - `map` - it operates on a map, which enables faster lookup but requires `deep` comparison of keys only. Check `MapCacheConfig` for more details.
 */
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

// Anys are needed as this is only a predicate passed to extends clause
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFnPredicate = (...args: any[]) => any;

type CacheBuilder = <Fn extends MemoizeFnPredicate, C extends MemoizeConfig>(f: Fn, config: C) => MemoizedInterface<Fn>;

type MemoizedInterface<Fn extends MemoizeFnPredicate, Key = Parameters<Fn>, Val = ReturnType<Fn>> = Fn & {
    get: (key: Key) => Val | undefined;
    set: (key: Key, value: Val) => void;
    clear: () => void;
    snapshot: () => Array<[Key, Val]>;
};

export type {MemoizeConfig, ExternalMemoizeConfig, CacheMode, MemoizedInterface, CacheBuilder, MemoizeFnPredicate};
