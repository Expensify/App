import _ from 'underscore';
import * as Store from '../store/Store';
import CONFIG from '../CONFIG';
import STOREKEYS from '../store/STOREKEYS';

let isAppOffline = false;

/**
 * Make an XHR to the server
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, data, type = 'post') {
    return Store.get(STOREKEYS.SESSION, 'authToken')
        .then((authToken) => {
            const formData = new FormData();
            formData.append('authToken', authToken);
            _.each(data, (val, key) => formData.append(key, val));
            return formData;
        })
        .then(formData => fetch(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, {
            method: type,
            body: formData,
        }))
        .then(response => response.json())
        .then((responseData) => {
            if (responseData.jsonCode === 200) {
                return responseData;
            }
            console.info('[API] Error', responseData);
        })
        // eslint-disable-next-line no-unused-vars
        .catch(() => {
            isAppOffline = true;

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        });
}

// Holds a queue of all the write requests that need to happen
const delayedWriteQueue = [];

/**
 * A method to write data to the API in a delayed fashion that supports the app being offline
 *
 * @param {string} command
 * @param {mixed} data
 * @returns {Promise}
 */
function delayedWrite(command, data) {
    return new Promise((resolve) => {
        // Add the write request to a queue of actions to perform
        delayedWriteQueue.push({
            command,
            data,
            callback: resolve,
        });
    });
}

/**
 * Process the write queue by looping through the queue and attempting to make the requests
 */
function processWriteQueue() {
    if (isAppOffline) {
        // Make a simple request to see if we're online again
        request('Get', null)
            .then(() => isAppOffline = false);
        return;
    }

    if (delayedWriteQueue.length === 0) {
        return;
    }

    for (let i = 0; i < delayedWriteQueue.length; i++) {
        // Take the request object out of the queue and make the request
        const delayedWriteRequest = delayedWriteQueue.shift();

        request(delayedWriteRequest.command, delayedWriteRequest.data)
            .then(delayedWriteRequest.callback)
            .catch(() => {
                // If the request failed, we need to put the request object back into the queue
                delayedWriteQueue.push(delayedWriteRequest);
            });
    }
}

// Process our write queue very often
setInterval(processWriteQueue, 1000);

export {
    request,
    delayedWrite,
};
