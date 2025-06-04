function init(keys: string[]) {
    if (!('caches' in window)) {
        throw new Error('Cache API is not supported');
    }
    keys.forEach((key) => {
        if (!key) {
            return;
        }
        caches.has(key).then((isExist) => {
            if (isExist) {
                return;
            } else {
                caches.open(key);
            }
        });
    });
}
function put(cacheName: string, key: string, value: Response) {
    if (!cacheName || !key || !value) {
        return;
    }
    caches.open(cacheName).then((cache) => {
        cache.put(key, value);
    });
}
function get(cacheName: string, key: string) {
    if (!cacheName || !key) {
        return;
    }
    return caches.open(cacheName).then((cache) => {
        return cache.match(key);
    });
}
function remove(cacheName: string, key: string) {
    if (!cacheName || !key) {
        return;
    }
    caches.open(cacheName).then((cache) => {
        cache.delete(key);
    });
}
function clear(cacheName: string) {
    if (!cacheName) {
        return;
    }
    caches.delete(cacheName);
}
export default {
    init,
    put,
    get,
    remove,
    clear,
};
