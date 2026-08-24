import CONST from '@src/CONST';

import HttpsError from './HttpsError';

/**
 * Whether the server never told us anything definite about this write.
 *
 * We check for a `status` rather than reading the message, because only the throws that handle a real HTTP response
 * set one — a rejection from `fetch` is a plain `Error`. The message is unreliable: on iOS nitro-fetch loses it and
 * reports `'Unknown St13runtime_error error.'`, so comparing against `FAILED_TO_FETCH` matches ~1% of real failures.
 *
 * The two message checks cover cases that do have a status but still never reached Auth (5xx, Auth socket down, 429).
 * Anything we do not recognise falls back to "no status", which is the side that keeps the user's data.
 */
function isNonAuthoritativeFailure(error: unknown): boolean {
    if (!(error instanceof HttpsError)) {
        return true;
    }

    if (!error.status) {
        return true;
    }

    return error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED || error.message === CONST.ERROR.THROTTLED;
}

export default isNonAuthoritativeFailure;
