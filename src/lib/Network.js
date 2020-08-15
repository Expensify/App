import _ from 'underscore';
import Ion from './Ion';
import CONFIG from '../CONFIG';
import IONKEYS from '../IONKEYS';
import ROUTES from '../ROUTES';
import {registerSocketEventCallback} from './Pusher/pusher';
import redirectToSignIn from './actions/ActionsSignInRedirect';

let isAppOffline = false;

registerSocketEventCallback((eventName, data) => {
    let isCurrentlyOffline = false;
    switch (eventName) {
        case 'connected':
            isCurrentlyOffline = false;
            break;
        case 'disconnected':
            isCurrentlyOffline = true;
            break;
        case 'state_change':
            if (data.current === 'connecting' || data.current === 'unavailable') {
                isCurrentlyOffline = true;
            }
            break;
        default:
            break;
    }
    isAppOffline = isCurrentlyOffline;
    Ion.merge(IONKEYS.NETWORK, {isOffline: isCurrentlyOffline});
});

/**
 * Make an XHR to the server
 *
 * @param {string} command
 * @param {mixed} data
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, data, type = 'post') {
    return Ion.get(IONKEYS.SESSION, 'authToken')
        .then((authToken) => {
            const formData = new FormData();

            // If we're calling Authenticate we don't need an authToken, so let's not send "undefined"
            if (command !== 'Authenticate') {
                formData.append('authToken', authToken);
            }
            _.each(data, (val, key) => formData.append(key, val));
            return formData;
        })
        .then(formData => fetch(`${CONFIG.EXPENSIFY.API_ROOT}command=${command}`, {
            method: type,
            body: formData,
        }))

        // This will catch any HTTP network errors (like 404s and such), not to be confused with jsonCode which this
        // does NOT catch
        .catch(() => {
            isAppOffline = true;
            Ion.merge(IONKEYS.NETWORK, {isOffline: true});

            // Throw a new error to prevent any other `then()` in the promise chain from being triggered (until another
            // catch() happens
            throw new Error('API is offline');
        })

        // Convert the data into JSON
        .then(response => response.json())

        // Handle any of our jsonCodes
        .then((responseData) => {
            if (responseData) {
                // AuthToken expired, go to the sign in page
                if (responseData.jsonCode === 407) {
                    redirectToSignIn();
                    throw new Error('[API] Auth token expired');
                }

                if (responseData.jsonCode !== 200) {
                    throw new Error(responseData.message);
                }
            }

            return responseData;
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
        // Don't do anything if we are offline. Once pusher reconnects, then it should be online again
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
