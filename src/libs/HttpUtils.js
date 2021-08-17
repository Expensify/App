import _ from 'underscore';
import CONFIG from '../CONFIG';
import CONST from '../CONST';

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
    const apiRoot = shouldUseSecure ? CONFIG.EXPENSIFY.URL_EXPENSIFY_SECURE : CONFIG.EXPENSIFY.URL_API_ROOT;
    return processHTTPRequest(`${apiRoot}api?command=${command}`, type, formData)
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
