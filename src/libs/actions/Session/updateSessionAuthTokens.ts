import Log from '@libs/Log';
import clearPrefetchOnAppStart from '@libs/Prefetch/clearPrefetchOnAppStart';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string, authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>) {
    // Startup prefetches are persisted natively across launches. Drop any queue/token-refresh
    // config tied to the previous auth token before saving the replacement.
    clearPrefetchOnAppStart().catch((error) => {
        Log.warn('[NitroFetch] clearPrefetchOnAppStart failed', {error});
    });

    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, authTokenType, creationDate: new Date().getTime()});
}
