function init(keys: string[]) {}
function put(cacheName: string, key: string, value: Response) {}
function get(cacheName: string, key: string) {}
function remove(cacheName: string, key: string) {}
function clear(cacheName: string) {}

export default {
    init,
    put,
    get,
    remove,
    clear,
};
