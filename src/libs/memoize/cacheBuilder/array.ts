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
        const {keys, values} = moized.cache.snapshot;

        if (!keys?.length) {
            return [];
        }

        return keys.map((k, i) => [k, values[i]] as [Args[], RT[]]);
    };

    return moized;
}

export default arrayCacheBuilder;
