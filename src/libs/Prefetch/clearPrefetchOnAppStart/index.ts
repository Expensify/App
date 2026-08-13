/**
 * Clears the prefetch on app start.
 */
import Log from '@libs/Log';

import {clearTokenRefresh, removeAllFromAutoprefetch} from 'react-native-nitro-fetch';

import type ClearPrefetchOnAppStart from './types';

const clearPrefetchOnAppStart: ClearPrefetchOnAppStart = async () => {
    clearTokenRefresh('fetch');

    await removeAllFromAutoprefetch().catch((error) => {
        Log.warn('[HttpUtils] removeAllFromAutoprefetch failed', {error});
    });
};

export default clearPrefetchOnAppStart;
