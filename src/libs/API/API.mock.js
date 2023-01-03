/* eslint-disable rulesdir/no-api-in-views */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from './API';
import Log from '../Log';

/**
 * A dictionary which has the name of a API command as key, and a function which
 * receives the api command parameters as value and is expected to return a response
 * object.
 */
const mocks = {
    BeginSignIn: () => require('../E2E/apiMocks/beginSignin.json'),
    SigninUser: () => require('../E2E/apiMocks/signinUser.json'),
    OpenApp: () => require('../E2E/apiMocks/openApp.json'),
    OpenReport: () => require('../E2E/apiMocks/openReport.json'),
    AuthenticatePusher: () => require('../E2E/apiMocks/authenticatePusher.json'),
};

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData.
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 *
 * @returns {Promise}
 */
function write(command, apiCommandParameters = {}) {
    const mockResponse = mocks[command] && mocks[command](apiCommandParameters);
    if (mockResponse && _.isArray(mockResponse.onyxData)) {
        Log.warn(`[API.read] for command ${command} is mocked!`);
        return Onyx.update(mockResponse.onyxData);
    }

    Log.warn(`[API.write] for command ${command} is not mocked yet!`);
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
    Log.warn('API.makeRequestWithSideEffects() is not implemented in the mock API. Please use API.createTransaction() instead.');
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(command, apiCommandParameters, onyxData, apiRequestType);
}

/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 *
 * @returns {Promise}
 */
function read(command, apiCommandParameters) {
    const mockResponse = mocks[command] && mocks[command](apiCommandParameters);
    if (mockResponse && _.isArray(mockResponse.onyxData)) {
        Log.warn(`[API.read] for command ${command} is mocked!`);
        return Onyx.update(mockResponse.onyxData);
    }

    Log.warn(`[API.read] for command ${command} is not mocked yet!`);
}

export {
    write,
    makeRequestWithSideEffects,
    read,
};
