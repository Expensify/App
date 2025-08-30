import CONST from '@src/CONST';

function init() {
    // Exit early if the Cache API is not supported in the current browser.
    if (!('caches' in window)) {
        throw new Error('Cache API is not supported');
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
function put(cacheName: string, key: string, value: Response) {
    const cacheAPIKeys: string[] = Object.values(CONST.CACHE_API_KEYS);
    if (!cacheAPIKeys.includes(cacheName)) {
        throw new Error('Failed to cache, invalid cacheName');
    }
    caches.open(cacheName).then((cache) => {
        cache.put(key, value);
    });
}
function get(cacheName: string, key: string) {
    return caches.open(cacheName).then((cache) => {
        return cache.match(key);
    });
}
function remove(cacheName: string, key: string) {
    caches.open(cacheName).then((cache) => {
        cache.delete(key);
    });
}
function clear() {
    const keys = Object.values(CONST.CACHE_API_KEYS);
    keys.forEach((key) => {
        if (!key) {
            return;
        }
        caches.delete(key);
    });
}
export default {
    init,
    put,
    get,
    remove,
    clear,
};
