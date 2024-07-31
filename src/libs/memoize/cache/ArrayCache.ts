import type {Cache, CacheConfig} from './types';

/**
 * Builder of the cache using `Array` primitive under the hood. It is an LRU cache, where the most recently accessed elements are at the end of the array, and the least recently accessed elements are at the front.
 * @param config - Cache configuration, check `CacheConfig` type for more details.
 * @returns
 */
function ArrayCache<K, V>(config: CacheConfig<K>): Cache<K, V> {
    const cache: Array<[K, V]> = [];

    const {maxSize, keyComparator} = config;

    /**
     * Returns the index of the key in the cache array.
     * We search the array backwards because the most recently added entries are at the end, and our heuristic follows the principles of an LRU cache - that the most recently added entries are most likely to be used again.
     */
    function getKeyIndex(key: K): number {
        for (let i = cache.length - 1; i >= 0; i--) {
            if (keyComparator(cache[i][0], key)) {
                return i;
            }
        }
        return -1;
    }

    return {
        get(key) {
            const index = getKeyIndex(key);

            if (index === -1) {
                return undefined;
            }

            const [entry] = cache.splice(index, 1);
            cache.push(entry);
            return {value: entry[1]};
        },

        set(key, value) {
            const index = getKeyIndex(key);

            if (index !== -1) {
                cache.splice(index, 1);
            }

            cache.push([key, value]);

            if (cache.length > maxSize) {
                cache.shift();
            }
        },

        getSet(key, valueProducer) {
            const index = getKeyIndex(key);

            if (index !== -1) {
                const [entry] = cache.splice(index, 1);
                cache.push(entry);
                return {value: entry[1]};
            }

            const value = valueProducer();

            cache.push([key, value]);

            if (cache.length > maxSize) {
                cache.shift();
            }

            return {value};
        },

        snapshot: {
            keys: () => cache.map((entry) => entry[0]),
            values: () => cache.map((entry) => entry[1]),
            entries: () => [...cache],
        },

        get size() {
            return cache.length;
        },
    };
}

export default ArrayCache;
