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

    return {
        // FIXME - Assumption is hot parts of the cache should have quicker access, so let's start our loops from the end
        has(key) {
            return cache.some((entry) => keyComparator(entry[0], key));
        },
        get(key) {
            return cache.find((entry) => keyComparator(entry[0], key))?.[1];
        },
        set(key, value) {
            // FIXME They are pretty slow, be mindful about it and improve - find better data structure
            const index = cache.findIndex((entry) => keyComparator(entry[0], key));

            if (index !== -1) {
                cache.splice(index, 1);
            }

            cache.push([key, value]);

            if (cache.length > opts.maxSize) {
                cache.shift();
            }
        },
        delete(key) {
            const index = cache.findIndex((entry) => keyComparator(entry[0], key));

            if (index !== -1) {
                cache.splice(index, 1);
            }
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
            cache() {
                return [...cache];
            },
        },
    };
}

export default buildArrayCache;
