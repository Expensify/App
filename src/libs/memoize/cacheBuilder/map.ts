type MapCacheConfig = {
    cacheMode: 'map';
    equalityCheck: 'deep';
    maxSize: number;
};

function mapCacheBuilder<Fn extends () => unknown, Key = Parameters<Fn>, Val = ReturnType<Fn>>(f: Fn, c: MapCacheConfig) {
    const cache = new Map<string, Val>();

    // FIXME - how to type this?
    function memoized(...args: Key) {
        // FIXME - this undermines the effect of using map as a cache struct - serialization might be causing perf and stability issues even with fast map lookup:
        // - the added overhead is dependent on size of arguments provided not cache size so that's a plus
        // - is serialization by JSON.stringify safe to use? How about complex objects, not serializable structs and order of parameters?
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = f(...args) as Val;
        cache.set(key, result);

        if (cache.size > c.maxSize) {
            // Maps should keep insertion order, so we can safely delete the first key
            cache.delete(cache.keys().next().value as string);
        }

        return result;
    }

    memoized.set = (args: Key, value: Val) => {
        const key = JSON.stringify(args);
        cache.set(key, value);
    };

    memoized.get = (args: Key) => {
        const key = JSON.stringify(args);
        cache.get(key);
    };

    memoized.clear = () => {
        cache.clear();
    };

    memoized.snapshot = () => Array.from(cache.entries());

    return memoized;
}

export default mapCacheBuilder;
