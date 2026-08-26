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
 * - NATIVE_FETCH_FAILED → failure (NitroFetch lost the underlying iOS network error)
 * - EXPENSIFY_SERVICE_INTERRUPTED → failure (server down: 500/502/504/520, auth socket)
 */
const FailureTracking: Middleware = (response) =>
    response
        .then((data) => {
            recordSuccess();
            return data;
        })
        .catch((error: Error) => {
            const isConnectivityError = [CONST.ERROR.FAILED_TO_FETCH, CONST.ERROR.NATIVE_FETCH_FAILED, CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED].some(
                (message) => message === error.message,
            );

            if (isConnectivityError && !getShouldFailAllRequests()) {
                recordFailure();
            }

            throw error;
        });

export default FailureTracking;
