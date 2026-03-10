import {recordFailure, recordSuccess} from '@libs/FailureTracker';
import CONST from '@src/CONST';
import type Middleware from './types';

/**
 * Middleware that observes request outcomes and feeds them to FailureTracker.
 *
 * - jsonCode 200 → success
 * - Network errors, 5xx, timeouts → failure
 * - REQUEST_CANCELLED and DUPLICATE_RECORD are ignored (not real failures)
 */
const FailureTracking: Middleware = (response) =>
    response
        .then((data) => {
            if (data?.jsonCode === 200) {
                recordSuccess();
            } else if (data?.jsonCode && data.jsonCode >= 500) {
                recordFailure();
            }
            return data;
        })
        .catch((error: Error) => {
            // Cancelled requests and duplicate records are not real connectivity failures
            if (error.name === CONST.ERROR.REQUEST_CANCELLED || error.message === CONST.ERROR.DUPLICATE_RECORD) {
                throw error;
            }

            recordFailure();
            throw error;
        });

export default FailureTracking;
