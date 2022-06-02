import _ from 'underscore';
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
                Log.info('Persisted request failed', false, {command: request.command, error: error.message});
                throw new Error('Retry request');
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
