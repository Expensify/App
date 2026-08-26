// Cache API only works for web, so we will return empty function here
function init() {}
function put(_cacheName?: unknown, _key?: unknown, _value?: unknown) {
    return Promise.resolve();
}
function get(_cacheName?: unknown, _key?: unknown) {
    return Promise.resolve(undefined);
}
function remove(_cacheName?: unknown, _key?: unknown) {
    return Promise.resolve(false);
}
function clear(_cacheName?: unknown) {
    return Promise.resolve();
}

export default {
    init,
    put,
    get,
    remove,
    clear,
};
