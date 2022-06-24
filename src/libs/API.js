import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as Request from './Request';
import * as SequentialQueue from './Network/SequentialQueue';
import {version} from '../../package.json';

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData.
 * That object will have all the data needed to make the WRITE request later. In other words, we'll queue the WRITE
 * request so that if the network is unavailable or the app is closed, we can send the WRITE request whenever the
 * network comes back.
 *
 * @param {String} command - Name of API command to call
 * @param {Object} apiCommandParameters - The object of parameters to send to the API
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - An object of data that will be merged into Onyx before the request is made
 * @param {Object} [onyxData.successData] - An object of data that will be merged into Onyx when the request succeeds.
 * @param {Object} [onyxData.failureData] - An object of data that will be merged into Onyx when the request fails.
 */
function write(command, apiCommandParameters = {}, onyxData = {}) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: version,
    };

    // Assemble all the request data we'll be storing in the queue
    const request = {
        command,
        data: {
            ...data,

            // This should be removed once we are no longer using deprecatedAPI https://github.com/Expensify/Expensify/issues/215650
            shouldRetry: true,
            canCancel: true,
        },
        ..._.omit(onyxData, 'optimisticData'),
    };

    // Write commands can be saved and retried, so push it to the SequentialQueue
    SequentialQueue.push(request);
}

/**
 * API.makeRequestWithSideEffects() is for blocking commands that have "side-effects" (such as authentication or
 * redirecting the user to other pages). It works just like API.read(), except that it will return a promise.
 * Since "side-effects" are something we're trying to avoid, the intention is to use API.makeRequestWithSideEffects()
 * only sparingly. These commands are often ones that contact third-party services, like Onfido and Plaid.
 *
 * @param {String} command - Name of API command to call
 * @param {Object} apiCommandParameters - The object of parameters to send to the API
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - An object of data that will be merged into Onyx before the request is made
 * @param {Object} [onyxData.successData] - An object of data that will be merged into Onyx when the request succeeds.
 * @param {Object} [onyxData.failureData] - An object of data that will be merged into Onyx when the request fails.
 * @returns {Promise}
 */
function makeRequestWithSideEffects(command, apiCommandParameters = {}, onyxData = {}) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: version,
    };

    // Assemble all the request data we'll be storing
    const request = {
        command,
        data,
        ..._.omit(onyxData, 'optimisticData'),
    };

    // Return a promise containing the response from HTTPS
    return Request.processWithMiddleware(request);
}

/**
 * Function for READ commands.
 * Calls to API.read() will not be persisted to disk. Instead, they will be immediately sent to the API without
 * utilizing a queue. This method will then utilize Onyx.update() to update Onyx with the API response received
 * via HTTPS.
 *
 * @param {String} command - Name of API command to call
 * @param {Object} apiCommandParameters - The object of parameters to send to the API
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - An object of data that will be merged into Onyx before the request is made
 * @param {Object} [onyxData.successData] - An object of data that will be merged into Onyx when the request succeeds.
 * @param {Object} [onyxData.failureData] - An object of data that will be merged into Onyx when the request fails.
 */
function read(command, apiCommandParameters, onyxData) {
    makeRequestWithSideEffects(command, apiCommandParameters, onyxData);
}

export {
    write,
    makeRequestWithSideEffects,
    read,
};
