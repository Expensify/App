import moize from 'moize';

type ArrayCacheConfig = {
    cacheMode: 'array';
    equalityCheck: 'deep' | 'shallow';
    maxSize: number;
};

function arrayCacheBuilder<Args, RT>(f: (...args: Args[]) => RT, c: ArrayCacheConfig) {
    // If cacheMode is array we proceed with moize
    const moizeConfig = {
        isDeepEqual: c.equalityCheck === 'deep',
        isShallowEqual: c.equalityCheck === 'shallow',
        maxSize: c.maxSize,
    };

    const moized = moize(f, moizeConfig);

    moized.snapshot = () => {
        const keys = moized.cache.snapshot.keys;
        const values = moized.cache.snapshot.values as Args[];

        if (!keys?.length) {
            return [];
        }

        return keys.map((k, i) => [k, values[i]]);
    };

    return moized;
}

export default arrayCacheBuilder;
