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
                const retryCount = PersistedRequests.incrementRetries(request);
                const logParams = {retryCount, command: request.command, error: error.message};
                Log.info('Persisted request failed', false, logParams);
                let logMessage = '';

                if (error.message === CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED) {
                    logMessage = 'Request failed because the Expensify backend is not available';
                } else if (error.message === CONST.ERROR.THROTTLED) {
                    logMessage = 'Request is being throttled';
                } else if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                    logMessage = 'Request failed too many times';
                } else {
                    // We are ok to do nothing and allow the SequentialQueue to retry the request
                    return;
                }

                // We shouldn't retry the request so log a message explaining why and remove the request from storage.
                Log.info(`${logMessage}, removing from storage`, false, logParams);
                PersistedRequests.remove(request);
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
