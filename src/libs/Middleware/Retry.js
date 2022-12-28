import * as PersistedRequests from '../actions/PersistedRequests';
import Log from '../Log';
import CONST from '../../CONST';

/**
 * @param {Promise} response
 * @param {Object} request
 * @param {Boolean} isFromSequentialQueue
 * @returns {Promise}
 */
function Retry(response, request, isFromSequentialQueue) {
    return response
        .catch((error) => {
            // Do not retry any requests that are cancelled
            if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
                return;
            }

            if (isFromSequentialQueue) {
                const logParams = {command: request.command, error: error.message};

                // If the backend is down don't retry the request
                if (error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED) {
                    Log.info('Request failed because the Expensify backend is not available, removing from storage', false, logParams);
                    PersistedRequests.remove(request);
                    return;
                }
                const retryCount = PersistedRequests.incrementRetries(request);
                logParams.retryCount = retryCount;
                Log.info('Persisted request failed', false, logParams);
                if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                    Log.info('Request failed too many times, removing from storage', false, logParams);
                    PersistedRequests.remove(request);
                }
                return;
            }

            if (request.command !== 'Log') {
                Log.hmmm('[Network] Handled error when making request', error);
            } else {
                console.debug('[Network] There was an error in the Log API command, unable to log to server!', error);
            }

            if (request.resolve) {
                request.resolve({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
            }
        });
}

export default Retry;
