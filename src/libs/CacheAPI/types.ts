import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type CacheName = ValueOf<typeof CONST.CACHE_API_KEYS>;
type CacheAPI = {
    init: () => void;
    put: (cacheName: CacheName, key: string, value: Response) => Promise<void>;
    get: (cacheName: CacheName, key: string) => Promise<Response | undefined>;
    remove: (cacheName: CacheName, key: string) => Promise<boolean>;
    clear: (cacheName?: CacheName) => Promise<void | boolean | boolean[]>;
};

export default CacheAPI;
