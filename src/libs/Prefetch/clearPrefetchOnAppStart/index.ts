/**
 * Clears the prefetch on app start.
 */
import Log from '@libs/Log';
import PrefetchQueries from '@libs/Prefetch/PrefetchQueries';

import {clearTokenRefresh, removeFromAutoPrefetch} from 'react-native-nitro-fetch';

import type ClearPrefetchOnAppStart from './types';

const clearPrefetchOnAppStart: ClearPrefetchOnAppStart = async () => {
    clearTokenRefresh('fetch');

    await Promise.all(
        Array.from(PrefetchQueries).map(async (command) => {
            await removeFromAutoPrefetch(command).catch((error) => {
                Log.warn(`[HttpUtils] removeFromAutoPrefetch failed for ${command}`, {error});
            });
        }),
    );
};

export default clearPrefetchOnAppStart;
