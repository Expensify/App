import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONFIG from '../CONFIG';
import ONYXKEYS from '../ONYXKEYS';
import NetworkConnection from './NetworkConnection';

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
        body
    })
        .then(response => response.json())

        // This will catch any HTTP network errors (like 404s and such), not to be confused with jsonCode which this
        // does NOT catch
        .catch(() => {
            NetworkConnection.setOfflineStatus(true);

            // Set an error state and signify we are done loading
            Onyx.merge(ONYXKEYS.SESSION, {loading: false, error: 'Cannot connect to server'});

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
}

/**
 * Makes XHR request
 * @param {String} command the name of the API command
 * @param {Object} data parameters for the API command
 * @param {String} type HTTP request type (get/post)
 * @returns {Promise}
 */
function xhr(command, data, type = 'post') {
    const formData = new FormData();
    _.each(data, (val, key) => formData.append(key, val));
    return processHTTPRequest(`${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=${command}`, type, formData);
}

/**
 * Just download a file from the web server.
 *
 * @param {String} relativePath From the website root, NOT the API root. (no leading slash, ., or ..)
 * @returns {Promise<Response>}
 */
function download(relativePath) {
    const siteRoot = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;

    // Strip leading slashes and periods from relative path, if present
    const strippedRelativePath = relativePath.charAt(0) === '/' || relativePath.charAt(0) === '.'
        ? relativePath.slice(relativePath.indexOf('/') + 1)
        : relativePath;

    return processHTTPRequest(`${siteRoot}${strippedRelativePath}`);
}

export default {
    download,
    xhr,
};
