import HttpUtils from '../HttpUtils';
import enhanceParameters from './enhanceParameters';
import * as NetworkEvents from './NetworkEvents';

/**
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {String} request.type
 * @param {Boolean} request.shouldUseSecure
 * @returns {Promise}
 */
export default function processRequest(request) {
    const finalParameters = enhanceParameters(request.command, request.data);
    const cancelRequestTimeoutTimer = NetworkEvents.startRequestTimeoutTimer();
    NetworkEvents.onRequest(request, finalParameters);
    return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure)
        .finally(() => cancelRequestTimeoutTimer());
}
