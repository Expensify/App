import type {Cache, CacheOpts} from '@libs/memoize/types';
import {getEqualityComparator} from '@libs/memoize/utils';

/**
 * Builder of the cache using `Array` primitive under the hood.
 * @param opts - Cache options, check `CacheOpts` type for more details.
 * @returns
 */
function buildArrayCache<K extends unknown[], V>(opts: CacheOpts): Cache<K, V> {
    const cache: Array<[K, V]> = [];

    const keyComparator = getEqualityComparator(opts);

    function getKeyIndex(key: K) {
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

            if (index !== -1) {
                const [entry] = cache.splice(index, 1);
                cache.push(entry);
                return {value: entry[1]};
            }
        },
        set(key, value) {
            const index = getKeyIndex(key);

            if (index !== -1) {
                cache.splice(index, 1);
            }

            cache.push([key, value]);

            if (cache.length > opts.maxSize) {
                cache.shift();
            }
        },
        delete(key) {
            const index = getKeyIndex(key);
            const has = index !== -1;

            if (has) {
                cache.splice(index, 1);
            }

            return has;
        },
        clear() {
            cache.length = 0;
        },
        snapshot: {
            keys() {
                return cache.map((entry) => entry[0]);
            },
            values() {
                return cache.map((entry) => entry[1]);
            },
            entries() {
                return [...cache];
            },
        },
        get size() {
            return cache.length;
        },
    };
}

export default buildArrayCache;
