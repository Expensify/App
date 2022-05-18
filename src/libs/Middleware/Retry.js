import lodashGet from 'lodash/get';
import RetryCounter from '../RetryCounter';
import * as PersistedRequests from '../actions/PersistedRequests';
import * as MainQueue from '../Network/MainQueue';
import Log from '../Log';
import CONST from '../../CONST';

// Keep track of retries for any non-persisted requests
const mainQueueRetryCounter = new RetryCounter();

/**
 * @param {Object} queuedRequest
 * @param {*} error
 * @returns {Boolean} true if we were able to retry
 */
function retryFailedRequest(queuedRequest, error) {
    // When the request did not reach its destination add it back the queue to be retried if we can
    const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
    if (!shouldRetry) {
        return false;
    }

    const retryCount = mainQueueRetryCounter.incrementRetries(queuedRequest);
    Log.info('[Network] A retryable request failed', false, {
        retryCount,
        command: queuedRequest.command,
        error: error.message,
    });

    if (retryCount < CONST.NETWORK.MAX_REQUEST_RETRIES) {
        MainQueue.push(queuedRequest);
        return true;
    }

    Log.info('[Network] Request was retried too many times with no success. No more retries left');
    return false;
}

/**
 * @param {Promise} response
 * @param {Object} request
 * @param {Boolean} isFromSequentialQueue
 * @returns {Promise}
 */
function Retry(response, request, isFromSequentialQueue) {
    return response
        .catch((error) => {
            if (isFromSequentialQueue) {
                const retryCount = PersistedRequests.incrementRetries(request);
                Log.info('Persisted request failed', false, {retryCount, command: request.command, error: error.message});
                if (retryCount >= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                    Log.info('Request failed too many times, removing from storage', false, {retryCount, command: request.command, error: error.message});
                    PersistedRequests.remove(request);
                }
                return;
            }

            if (retryFailedRequest(request, error)) {
                return;
            }

            if (request.command !== 'Log') {
                Log.hmmm('[Network] Handled error when making request', error);
            } else {
                console.debug('[Network] There was an error in the Log API command, unable to log to server!', error);
            }

            request.resolve({jsonCode: CONST.JSON_CODE.UNABLE_TO_RETRY});
        });
}

export default Retry;
