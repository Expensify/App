import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import HttpUtils from '../HttpUtils';
import enhanceParameters from './enhanceParameters';
import * as NetworkEvents from './NetworkEvents';
import * as PersistedRequests from '../actions/PersistedRequests';

/**
 * @param {Object} request
 * @param {Object} parameters
 */
function logRequestDetails(request, parameters) {
    // Don't log about log or else we'd cause an infinite loop
    if (request.command === 'Log') {
        return;
    }

    NetworkEvents.getLogger().info('Making API request', false, {
        command: request.command,
        type: request.type,
        shouldUseSecure: request.shouldUseSecure,
        rvl: parameters.returnValueList,
    });
}

/**
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {String} request.type
 * @param {Boolean} request.shouldUseSecure
 * @returns {Promise}
 */
export default function processRequest(request) {
    const persisted = lodashGet(request, 'data.persist', false);
    const finalParameters = enhanceParameters(request.command, request.data);

    // When the request goes past a certain amount of time we trigger a re-check of the connection
    const cancelRequestTimeoutTimer = NetworkEvents.startRecheckTimeoutTimer();
    logRequestDetails(request, finalParameters);
    return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure)
        .then((response) => {
            // Auth is down
            if (response.jsonCode === CONST.JSON_CODE.EXP_ERROR && response.type === CONST.ERROR_TYPE.SOCKET) {
                NetworkEvents.getLogger().hmmm('[Network] Issue connecting to database when making request');
                throw new Error(CONST.ERROR.FAILED_TO_FETCH);
            }

            // We got a successful response from the server. This request is a persisted one so we can remove it.
            if (persisted) {
                PersistedRequests.remove(request);
            }
            NetworkEvents.triggerResponse(request, response);
            return response;
        })
        .catch((error) => {
            // Persisted requests should never throw since they are only either removed from the queue on success or left in the queue to be retried again later.
            if (!persisted && error.message === CONST.ERROR.FAILED_TO_FETCH) {
                // This situation is common if a user is offline or experiencing an unlikely scenario like
                // Auth down, incorrect url, bad cors headers returned by the server, DNS lookup failure etc.
                throw error;
            }

            // Cancelled requests are normal and can happen when a user logs out. No extra handling is needed here besides
            // remove the request from the PersistedRequests if the request exists as it was "cancelled" and should not be run again.
            if (error.name === CONST.ERROR.REQUEST_CANCELLED) {
                NetworkEvents.getLogger().info('[Network] Request canceled', false, request);
                if (persisted) {
                    PersistedRequests.remove(request);
                }
            } else {
                // If we get any error that is not "Failed to fetch" create GitHub issue so we can look into what exactly happened.
                NetworkEvents.getLogger().alert(`${CONST.ERROR.ENSURE_BUGBOT} unknown error caught while processing request`, {
                    command: request.command,
                    error: error.message,
                });
            }
        })
        .finally(() => cancelRequestTimeoutTimer());
}
