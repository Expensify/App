import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as Request from './Request';
import * as SequentialQueue from './Network/SequentialQueue';
import {version} from '../../package.json';

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData.
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * @param {String} command - Name of API command to call
 * @param {Object} apiCommandParameters - Name value pairs of parameters to send to the API
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200
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
 * For commands where the network response must be accessed directly or when there is functionality that can only happen once the request is finished (eg. calling third-party services like Onfide and Plaid, redirecting a user depending on the response data, etc.). 
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted. 
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 *
 * @param {String} command - Name of API command to call
 * @param {Object} apiCommandParameters - The object of parameters to send to the API
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
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
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 */
function read(command, apiCommandParameters, onyxData) {
    makeRequestWithSideEffects(command, apiCommandParameters, onyxData);
}

export {
    write,
    makeRequestWithSideEffects,
    read,
};
