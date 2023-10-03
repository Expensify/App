import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import HttpsError from './Errors/HttpsError';
import * as ApiUtils from './ApiUtils';
import alert from '../components/Alert';

let shouldFailAllRequests = false;
let shouldForceOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldFailAllRequests = Boolean(network.shouldFailAllRequests);
        shouldForceOffline = Boolean(network.shouldForceOffline);
    },
});

// We use the AbortController API to terminate pending request in `cancelPendingRequests`
let cancellationController = new AbortController();

/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 *
 * @param {String} url
 * @param {String} [method]
 * @param {Object} [body]
 * @param {Boolean} [canCancel]
 * @returns {Promise}
 */
function processHTTPRequest(url, method = 'get', body = null, canCancel = true) {
    return fetch(url, {
        // We hook requests to the same Controller signal, so we can cancel them all at once
        signal: canCancel ? cancellationController.signal : undefined,
        method,
        body,
    })
        .then((response) => {
            // Test mode where all requests will succeed in the server, but fail to return a response
            if (shouldFailAllRequests || shouldForceOffline) {
                throw new HttpsError({
                    message: CONST.ERROR.FAILED_TO_FETCH,
                });
            }

            if (!response.ok) {
                // Expensify site is down or there was an internal server error, or something temporary like a Bad Gateway, or unknown error occurred
                const serviceInterruptedStatuses = [
                    CONST.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    CONST.HTTP_STATUS.BAD_GATEWAY,
                    CONST.HTTP_STATUS.GATEWAY_TIMEOUT,
                    CONST.HTTP_STATUS.UNKNOWN_ERROR,
                ];
                if (_.contains(serviceInterruptedStatuses, response.status)) {
                    throw new HttpsError({
                        message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                        status: response.status,
                        title: 'Issue connecting to Expensify site',
                    });
                } else if (response.status === CONST.HTTP_STATUS.TOO_MANY_REQUESTS) {
                    throw new HttpsError({
                        message: CONST.ERROR.THROTTLED,
                        status: response.status,
                        title: 'API request throttled',
                    });
                }

                throw new HttpsError({
                    message: response.statusText,
                    status: response.status,
                });
            }

            return response.json();
        })
        .then((response) => {
            // Some retried requests will result in a "Unique Constraints Violation" error from the server, which just means the record already exists
            if (response.jsonCode === CONST.JSON_CODE.BAD_REQUEST && response.message === CONST.ERROR_TITLE.DUPLICATE_RECORD) {
                throw new HttpsError({
                    message: CONST.ERROR.DUPLICATE_RECORD,
                    status: CONST.JSON_CODE.BAD_REQUEST,
                    title: CONST.ERROR_TITLE.DUPLICATE_RECORD,
                });
            }

            // Auth is down or timed out while making a request
            if (response.jsonCode === CONST.JSON_CODE.EXP_ERROR && response.title === CONST.ERROR_TITLE.SOCKET && response.type === CONST.ERROR_TYPE.SOCKET) {
                throw new HttpsError({
                    message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                    status: CONST.JSON_CODE.EXP_ERROR,
                    title: CONST.ERROR_TITLE.SOCKET,
                });
            }
            if (response.jsonCode === CONST.JSON_CODE.MANY_WRITES_ERROR) {
                const {phpCommandName, authWriteCommands} = response.data;
                // eslint-disable-next-line max-len
                const message = `The API call (${phpCommandName}) did more Auth write requests than allowed. Count ${authWriteCommands.length}, commands: ${authWriteCommands.join(
                    ', ',
                )}. Check the APIWriteCommands class in Web-Expensify`;
                alert('Too many auth writes', message);
            }
            return response;
        });
}

/**
 * Makes XHR request
 * @param {String} command the name of the API command
 * @param {Object} data parameters for the API command
 * @param {String} type HTTP request type (get/post)
 * @param {Boolean} shouldUseSecure should we use the secure server
 * @returns {Promise}
 */
function xhr(command, data, type = CONST.NETWORK.METHOD.POST, shouldUseSecure = false) {
    const formData = new FormData();
    _.each(data, (val, key) => {
        // Do not send undefined request parameters to our API. They will be processed as strings of 'undefined'.
        if (_.isUndefined(val)) {
            return;
        }

        formData.append(key, val);
    });

    const url = ApiUtils.getCommandURL({shouldUseSecure, command});
    return processHTTPRequest(url, type, formData, data.canCancel);
}

function cancelPendingRequests() {
    cancellationController.abort();

    // We create a new instance because once `abort()` is called any future requests using the same controller would
    // automatically get rejected: https://dom.spec.whatwg.org/#abortcontroller-api-integration
    cancellationController = new AbortController();
}

export default {
    xhr,
    cancelPendingRequests,
};
