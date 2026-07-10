import {getEnvironmentURL} from '@libs/Environment/Environment';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type CacheNameType = ValueOf<typeof CONST.CACHE_NAME>;

let environmentURL: string;
getEnvironmentURL().then((url: string) => (environmentURL = url));

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

function put(cacheName: CacheNameType, key: string, value: Response) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    const cacheKey = `${environmentURL}/${key}`;

    return caches.open(cacheName).then((cache) => cache.put(cacheKey, value));
}

function get(cacheName: CacheNameType, key: string) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    const cacheKey = `${environmentURL}/${key}`;

    return caches.open(cacheName).then((cache) => cache.match(cacheKey));
}

function remove(cacheName: CacheNameType, key: string) {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        Log.warn('Cache API is not supported');
        return;
    }

    const cacheKey = `${environmentURL}/${key}`;

    return caches.open(cacheName).then((cache) => cache.delete(cacheKey));
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
