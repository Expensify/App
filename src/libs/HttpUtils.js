import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import HttpsError from './Errors/HttpsError';

let shouldUseSecureStaging = false;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: val => shouldUseSecureStaging = (val && _.isBoolean(val.shouldUseSecureStaging)) ? val.shouldUseSecureStaging : false,
});

let shouldFailAllRequests = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => shouldFailAllRequests = (val && _.isBoolean(val.shouldFailAllRequests)) ? val.shouldFailAllRequests : false,
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
            if (shouldFailAllRequests) {
                throw new HttpsError({
                    message: CONST.ERROR.FAILED_TO_FETCH,
                });
            }

            if (!response.ok) {
                throw new HttpsError({
                    message: response.statusText,
                    status: response.status,
                });
            }

            return response.json();
        })
        .then((response) => {
            // Auth is down or timed out while making a request
            if (response.jsonCode === CONST.JSON_CODE.EXP_ERROR && response.title === CONST.ERROR_TITLE.SOCKET && response.type === CONST.ERROR_TYPE.SOCKET) {
                throw new HttpsError({
                    message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED,
                    type: CONST.ERROR_TYPE.SOCKET,
                    title: CONST.ERROR_TITLE.SOCKET,
                    jsonCode: CONST.JSON_CODE.EXP_ERROR,
                });
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
    let apiRoot = shouldUseSecure ? CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL : CONFIG.EXPENSIFY.URL_API_ROOT;

    if (shouldUseSecure && shouldUseSecureStaging) {
        apiRoot = CONST.STAGING_SECURE_URL;
    }

    return processHTTPRequest(`${apiRoot}api?command=${command}`, type, formData, data.canCancel);
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
