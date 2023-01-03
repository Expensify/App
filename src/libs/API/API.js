import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as Request from '../Request';
import * as SequentialQueue from '../Network/SequentialQueue';
import pkg from '../../../package.json';
import CONST from '../../CONST';

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData.
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 */
function write(command, apiCommandParameters = {}, onyxData = {}) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: pkg.version,
        apiRequestType: CONST.API_REQUEST_TYPE.WRITE,
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
 * For commands where the network response must be accessed directly or when there is functionality that can only
 * happen once the request is finished (eg. calling third-party services like Onfido and Plaid, redirecting a user
 * depending on the response data, etc.).
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted.
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 * @param {String} [apiRequestType] - Can be either 'read', 'write', or 'makeRequestWithSideEffects'. We use this to either return the chained
 *                                    response back to the caller or to trigger reconnection callbacks when re-authentication is required.
 * @returns {Promise}
 */
function makeRequestWithSideEffects(command, apiCommandParameters = {}, onyxData = {}, apiRequestType = CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS) {
    // Optimistically update Onyx
    if (onyxData.optimisticData) {
        Onyx.update(onyxData.optimisticData);
    }

    // Assemble the data we'll send to the API
    const data = {
        ...apiCommandParameters,
        appversion: pkg.version,
        apiRequestType,
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
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 * @param {Object} onyxData  - Object containing errors, loading states, and optimistic UI data that will be merged
 *                             into Onyx before and after a request is made. Each nested object will be formatted in
 *                             the same way as an API response.
 * @param {Object} [onyxData.optimisticData] - Onyx instructions that will be passed to Onyx.update() before the request is made.
 * @param {Object} [onyxData.successData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode === 200.
 * @param {Object} [onyxData.failureData] - Onyx instructions that will be passed to Onyx.update() when the response has jsonCode !== 200.
 */
function read(command, apiCommandParameters, onyxData) {
    // Ensure all write requests on the sequential queue have finished responding before running read requests.
    // Responses from read requests can overwrite the optimistic data inserted by
    // write requests that use the same Onyx keys and haven't responded yet.
    SequentialQueue.waitForIdle().then(() => makeRequestWithSideEffects(command, apiCommandParameters, onyxData, CONST.API_REQUEST_TYPE.READ));
}

export {
    write,
    makeRequestWithSideEffects,
    read,
};
