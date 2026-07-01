import {clearTokenRefresh, removeFromAutoPrefetch} from 'react-native-nitro-fetch';
import Log from '@libs/Log';
import PrefetchQueries from '@libs/Prefetch/PrefetchQueries';
import type ClearPrefetchOnAppStart from './types';

const clearPrefetchOnAppStart: ClearPrefetchOnAppStart = () => {
    clearTokenRefresh('fetch');

    for (const command of PrefetchQueries) {
        removeFromAutoPrefetch(command).catch((error) => {
            Log.warn(`[HttpUtils] removeFromAutoPrefetch failed for ${command}`, {error});
        });
    }
};

export default clearPrefetchOnAppStart;
