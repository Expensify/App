import Log from '@libs/Log';
import clearPrefetchOnAppStart from '@libs/Prefetch/clearPrefetchOnAppStart';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string) {
    // Startup prefetches are persisted natively across launches. Drop any queue/token-refresh
    // config tied to the previous auth token before saving the replacement.
    clearPrefetchOnAppStart().catch((error) => {
        Log.warn('[NitroFetch] clearPrefetchOnAppStart failed', {error});
    });

    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, creationDate: new Date().getTime()});
}
