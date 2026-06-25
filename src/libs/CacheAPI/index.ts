import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import CONST from '@src/CONST';

type CacheNameType = ValueOf<typeof CONST.CACHE_API_KEYS>;

/**
 * Build a stable, absolute request key for a cache entry.
 *
 * The Cache API treats a string key as a Request, which resolves relative URLs against the current
 * `document.baseURI`. That base changes with the active route (e.g. an attachment is written from the
 * report at `/r/<reportID>` but read back from the attachment modal at `/attachment?...`), so a bare
 * `attachmentID` would resolve to different absolute URLs and `cache.match` would miss. Anchoring the
 * key to the origin keeps `put`/`match`/`delete` consistent regardless of the route in use.
 */
function getRequestKey(key: string): string {
    return new URL(`/__cache__/${encodeURIComponent(key)}`, window.location.origin).toString();
}

function init() {
    // Exit early if the Cache API is not supported in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }
    const keys = Object.values(CONST.CACHE_API_KEYS);
    for (const key of keys) {
        caches.has(key).then((isExist) => {
            if (isExist) {
                return;
            }
            caches.open(key);
        });
    }
}

function put(cacheName: CacheNameType, key: string, value: Response) {
    return caches.open(cacheName).then((cache) => cache.put(getRequestKey(key), value));
}

function get(cacheName: CacheNameType, key: string) {
    return caches.open(cacheName).then((cache) => cache.match(getRequestKey(key)));
}

function remove(cacheName: CacheNameType, key: string) {
    return caches.open(cacheName).then((cache) => cache.delete(getRequestKey(key)));
}

function clear(cacheName?: CacheNameType) {
    // If a cache name is provided, delete only that key.
    if (cacheName) {
        return caches.delete(cacheName);
    }

    const keys = Object.values(CONST.CACHE_API_KEYS);
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
