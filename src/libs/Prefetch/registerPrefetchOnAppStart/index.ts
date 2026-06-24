import {prefetchOnAppStart} from 'react-native-nitro-fetch';
import Log from '@libs/Log';
import registerPrefetchTokenRefresh from '@libs/registerPrefetchTokenRefresh/index.native';
import type RegisterPrefetchOnAppStart from './types';

const registerPrefetchOnAppStart: RegisterPrefetchOnAppStart = ({prefetchKey, fetchParams, command, url}) => {
    if (!prefetchKey) {
        return;
    }

    registerPrefetchTokenRefresh();
    prefetchOnAppStart(url, fetchParams).catch((error) => {
        Log.warn(`[HttpUtils] prefetchOnAppStart failed for ${command}`, {error, fetchParams, url});
    });
};

export default registerPrefetchOnAppStart;
