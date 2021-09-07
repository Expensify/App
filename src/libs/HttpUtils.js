import _ from 'underscore';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import getEnvironment from './Environment/getEnvironment';

// To avoid a circular dependency, we can't include Log here, so instead, we define an empty logging method and expose the setLogger method to set the logger from outside this file
let info = () => {};

/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 *
 * @param {String} url
 * @param {String} method
 * @param {Object} body
 * @returns {Promise}
 */
function processHTTPRequest(url, method = 'get', body = null) {
    return fetch(url, {
        method,
        body,
    })
        .then(response => response.json());
}

/**
 * @param {Boolean} shouldUseSecure
 * @returns {Promise}
 */
function getAPIRoot(shouldUseSecure) {
    if (!shouldUseSecure) {
        return Promise.resolve(CONFIG.EXPENSIFY.URL_API_ROOT);
    }

    return getEnvironment()
        .then((env) => {
            // The native apps will use the endpoints defined in .env.production as those builds are moved to release from Play Store / TestFlight respectively.
            // We want to use the staging secure endpoint in these cases so that things like Plaid, Onfido, etc can be QA tested.
            if (env === CONST.ENVIRONMENT.STAGING) {
                return CONST.STAGING_SECURE_URL;
            }

            return CONFIG.EXPENSIFY.URL_EXPENSIFY_SECURE;
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
    if (command !== 'Log') {
        info('Making API request', false, {
            command,
            type,
            shouldUseSecure,
            rvl: data.returnValueList,
        });
    }
    const formData = new FormData();
    _.each(data, (val, key) => formData.append(key, val));
    return getAPIRoot(shouldUseSecure)
        .then(apiRoot => processHTTPRequest(`${apiRoot}api?command=${command}`, type, formData))
        .then((response) => {
            if (command !== 'Log') {
                info('Finished API request', false, {
                    command,
                    type,
                    shouldUseSecure,
                    jsonCode: response.jsonCode,
                    requestID: response.requestID,
                });
            }
            return response;
        });
}

/**
 * Just download a file from the web server.
 *
 * @param {String} relativePath From the website root, NOT the API root. (no leading slash, ., or ..)
 * @returns {Promise}
 */
function download(relativePath) {
    const siteRoot = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;

    // Strip leading slashes and periods from relative path, if present
    const strippedRelativePath = relativePath.charAt(0) === '/' || relativePath.charAt(0) === '.'
        ? relativePath.slice(relativePath.indexOf('/') + 1)
        : relativePath;

    return processHTTPRequest(`${siteRoot}${strippedRelativePath}`);
}

function setLogger(logger) {
    info = logger.info;
}

export default {
    setLogger,
    download,
    xhr,
};
