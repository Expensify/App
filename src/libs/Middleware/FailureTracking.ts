import {recordFailure, recordSuccess} from '@libs/FailureTracker';
import {getShouldFailAllRequests} from '@libs/NetworkState';

import CONST from '@src/CONST';

import type Middleware from './types';

/**
 * Middleware that observes request outcomes and feeds them to FailureTracker.
 *
 * Any resolved response counts as success — if the server responded at all, the network works.
 * Only genuine connectivity issues count as failures:
 * - FAILED_TO_FETCH → failure (DNS, no internet, network timeout)
 * - EXPENSIFY_SERVICE_INTERRUPTED → failure (server down: 500/502/504/520, auth socket)
 * - SERVICE_UNAVAILABLE → success (app-level 503 inside an HTTP 200, so the server answered)
 */
const FailureTracking: Middleware = (response) =>
    response
        .then((data) => {
            recordSuccess();
            return data;
        })
        .catch((error: Error) => {
            // An app-level 503 is rejected so the write retries, but it still arrived in an HTTP 200,
            // so it proves reachability and must clear any failures recorded before it.
            if (error.message === CONST.ERROR.SERVICE_UNAVAILABLE) {
                recordSuccess();
                throw error;
            }

            const isConnectivityError = error.message === CONST.ERROR.FAILED_TO_FETCH || error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED;

            if (isConnectivityError && !getShouldFailAllRequests()) {
                recordFailure();
            }

            throw error;
        });

export default FailureTracking;
