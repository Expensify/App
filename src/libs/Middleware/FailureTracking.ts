import {recordFailure, recordSuccess} from '@libs/FailureTracker';
import CONST from '@src/CONST';
import type Middleware from './types';

/**
 * Middleware that observes request outcomes and feeds them to FailureTracker.
 *
 * Any resolved response counts as success — if the server responded at all, the network works.
 * Only genuine connectivity issues count as failures:
 * - FAILED_TO_FETCH → failure (DNS, no internet, network timeout)
 * - EXPENSIFY_SERVICE_INTERRUPTED → failure (server down: 500/502/504/520, auth socket)
 */
const FailureTracking: Middleware = (response) =>
    response
        .then((data) => {
            recordSuccess();
            return data;
        })
        .catch((error: Error) => {
            const isConnectivityError = error.message === CONST.ERROR.FAILED_TO_FETCH || error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED;

            if (isConnectivityError) {
                recordFailure();
            }

            throw error;
        });

export default FailureTracking;
