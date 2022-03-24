import CONST from '../../CONST';
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

    // If request is still in processing after this time, we might be offline
    const timerId = setTimeout(() => NetworkEvents.triggerRecheckNeeded(), CONST.NETWORK.MAX_PENDING_TIME_MS);

    NetworkEvents.onRequest(request, finalParameters);
    return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure)
        .finally(() => clearTimeout(timerId));
}
