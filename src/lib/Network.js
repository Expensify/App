import _ from 'underscore';
import NetInfo from '@react-native-community/netinfo';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';

/**
 * Called when the offline status of the app changes and if the network is "reconnecting" (going from offline to online)
 * then all of the reconnection callbacks are triggered
 *
 * @param {boolean} isCurrentlyOffline
 */
function setOfflineStatus(isCurrentlyOffline) {
    Ion.merge(IONKEYS.NETWORK, {isOffline: isCurrentlyOffline});
}

// Subscribe to the state change event via NetInfo so we can update
// whether a user has internet connectivity or not. This is more reliable
// than the Pusher `disconnected` event which takes about 10-15 seconds to emit
NetInfo.addEventListener((state) => {
    setOfflineStatus(!state.isConnected);
});

/**
 * Send an HTTP request, and attempt to resolve the json response.
 * If there is a network error, we'll set the application offline.
 *
 * @param {String} url
 * @param {String} method
 * @param {Object} body
 * @returns {Promise<Response | void>}
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
            setOfflineStatus(true);

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
    return processHTTPRequest(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, type, formData);
}

/**
 * Just download a file from the web server.
 *
 * @param {String} relativePath From the website root, NOT the API root. (no leading slash, ., or ..)
 * @returns {Promise<Response>}
 */
function download(relativePath) {
    const siteRoot = CONFIG.EXPENSIFY.SITE_ROOT;

    // Strip leading slashes and periods from relative path, if present
    const strippedRelativePath = _.startsWith(relativePath, '/') || _.startsWith(relativePath, '.')
        ? relativePath.slice(relativePath.indexOf('/') + 1)
        : relativePath;

    return processHTTPRequest(`${siteRoot}${strippedRelativePath}`);
}

export {
    download,
    xhr,
    setOfflineStatus,
};
