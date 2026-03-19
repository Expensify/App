import {recordFailure, recordSuccess} from '@libs/FailureTracker';
import CONST from '@src/CONST';
import type Middleware from './types';

/**
 * Middleware that observes request outcomes and feeds them to FailureTracker.
 *
 * Only genuine connectivity issues count as failures:
 * - jsonCode 200 → success (server responded normally)
 * - FAILED_TO_FETCH → failure (DNS, no internet, network timeout)
 * - EXPENSIFY_SERVICE_INTERRUPTED → failure (server down: 500/502/504/520, auth socket)
 * - Everything else (429 throttle, 4xx, cancelled, duplicate) → ignored (server responded, connectivity is fine)
 */
const FailureTracking: Middleware = (response) =>
    response
        .then((data) => {
            if (data?.jsonCode === 200) {
                recordSuccess();
            }
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
