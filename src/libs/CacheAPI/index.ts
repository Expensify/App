import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type CacheNameType = ValueOf<typeof CONST.CACHE_NAME>;

function init() {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }
    const keys = Object.values(CONST.CACHE_NAME);
    for (const key of keys) {
        caches.has(key).then((isExist) => {
            if (isExist) {
                return;
            }
            caches.open(key);
        });
    }
}

// Keys are passed through unchanged. Callers are responsible for anchoring keys
// to the origin (e.g. `getAttachmentCacheKey` builds an absolute URL via
// `new URL(..., window.location.origin)`), so the Cache API resolves them
// consistently regardless of the active route. Prefixing here would race with
// async environment resolution and diverge from main's key scheme.
function put(cacheName: CacheNameType, key: string, value: Response) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    return caches.open(cacheName).then((cache) => cache.put(key, value));
}

function get(cacheName: CacheNameType, key: string) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    return caches.open(cacheName).then((cache) => cache.match(key));
}

function remove(cacheName: CacheNameType, key: string) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    return caches.open(cacheName).then((cache) => cache.delete(key));
}

function clear(cacheName?: CacheNameType) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    // If a cache name is provided, delete only that key.
    if (cacheName) {
        return caches.delete(cacheName);
    }

    const keys = Object.values(CONST.CACHE_NAME);
    const deletePromises = keys.map((key) => caches.delete(key));

    return Promise.all(deletePromises);
}

export default {
    init,
    put,
    get,
    remove,
    clear,
};
