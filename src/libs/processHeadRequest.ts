/** Process authenticated image probes without JSON API middleware or response parsing. */
import CONST from '@src/CONST';

import HttpUtils from './HttpUtils';
import Log from './Log';
import {hasReadRequiredDataFromStorage} from './Network/NetworkStore';
import {getIsOffline} from './NetworkState';
import sanitizeLogParams from './sanitizeLogParams';

type HeadRequest = {
    imageURL: string;
    /** Cancels this probe without cancelling shared authentication. */
    signal?: AbortSignal;
};

async function processHeadRequest({imageURL, signal}: HeadRequest): Promise<number | undefined> {
    try {
        // Authentication imports user actions that depend on API, so load its owner after API initialization.
        const {reauthenticate} = await import('./Middleware/Reauthentication');
        await hasReadRequiredDataFromStorage();
        if (getIsOffline()) {
            return CONST.HTTP_STATUS.FORBIDDEN;
        }

        Log.info('[Network] Making HEAD request', false, sanitizeLogParams({imageURL}));
        const status = await HttpUtils.head(imageURL, signal);
        if (status !== CONST.HTTP_STATUS.UNAUTHORIZED || signal?.aborted || getIsOffline()) {
            return status;
        }

        const result = await reauthenticate('HeadAttachment');
        if (!result.wasSuccessful) {
            return status;
        }

        // Return the replay directly so a rejected replacement token cannot start another authentication cycle.
        return await HttpUtils.head(imageURL, signal);
    } catch (error) {
        // Transport errors can contain credential-bearing URLs, so log only the error name.
        Log.info('[Network] HEAD request failed', false, {name: error instanceof Error ? error.name : CONST.ERROR.UNKNOWN_ERROR});
        return undefined;
    }
}

export default processHeadRequest;
export type {HeadRequest};
