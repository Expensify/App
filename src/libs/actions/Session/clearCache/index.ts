import Log from '@libs/Log';
import CONST from '@src/CONST';
import type ClearCache from './types';

const clearStorage: ClearCache = async () => {
    if (!('caches' in window)) {
        return;
    }

    try {
        await caches.delete(CONST.CACHE_NAME.AUTH_IMAGES);
    } catch (error) {
        Log.alert('[AuthImageCache] Error clearing auth image cache:', {message: (error as Error).message});
    }
};

export default clearStorage;
