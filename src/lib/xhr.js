import _ from 'underscore';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';
import NetworkConnection from './NetworkConnection';

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

    return fetch(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, {
        method: type,
        body: formData,
    })
        .then(response => response.json())

        // This will catch any HTTP network errors (like 404s and such), not to be confused with jsonCode which this
        // does NOT catch
        .catch(() => {
            NetworkConnection.setOfflineStatus(true);

            // Set an error state and signify we are done loading
            Ion.merge(IONKEYS.SESSION, {loading: false, error: 'Cannot connect to server'});

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
}

export default xhr;
