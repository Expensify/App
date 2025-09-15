import Log from '@libs/Log';
import CONST from '@src/CONST';

type CacheNameType = (typeof CONST.CACHE_API_KEYS)[keyof typeof CONST.CACHE_API_KEYS];

function init() {
    // Exit early if the Cache API is not supported in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
    }
    const keys = Object.values(CONST.CACHE_API_KEYS);
    keys.forEach((key) => {
        caches.has(key).then((isExist) => {
            if (isExist) {
                return;
            }
            caches.open(key);
        });
    });
}

function put(cacheName: CacheNameType, key: string, value: Response) {
    return caches.open(cacheName).then((cache) => cache.put(key, value));
}

function get(cacheName: CacheNameType, key: string) {
    return caches.open(cacheName).then((cache) => cache.match(key));
}

function remove(cacheName: CacheNameType, key: string) {
    return caches.open(cacheName).then((cache) => cache.delete(key));
}

function clear(cacheName?: CacheNameType) {
    // If a cache name is provided, delete only that key.
    if (cacheName) {
        return caches.delete(cacheName);
    }

    const keys = Object.values(CONST.CACHE_API_KEYS);
    const deletePromises = keys.map((key) => caches.delete(key));

    return Promise.all(deletePromises).then(Promise.resolve).catch(Promise.reject);
}
export default {
    init,
    put,
    get,
    remove,
    clear,
};
