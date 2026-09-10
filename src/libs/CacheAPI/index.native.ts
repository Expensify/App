import type CacheAPI from './types';

// Cache API only works for web, so we will return empty function here
const init = () => {};
const put = () => Promise.resolve();
const get = () => Promise.resolve(undefined);
const remove = () => Promise.resolve(false);
const clear = () => Promise.resolve();

const cacheAPI: CacheAPI = {
    init,
    put,
    get,
    remove,
    clear,
};

export default cacheAPI;
