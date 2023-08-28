import _ from 'underscore';
import HttpUtils from './HttpUtils';
import enhanceParameters from './Network/enhanceParameters';
import * as NetworkStore from './Network/NetworkStore';

let middlewares = [];

/**
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {String} request.type
 * @param {Boolean} request.shouldUseSecure
 * @returns {Promise}
 */
function makeXHR(request) {
    const finalParameters = enhanceParameters(request.command, request.data);
    return NetworkStore.hasReadRequiredDataFromStorage().then(() => {
        // If we're using the Supportal token and this is not a Supportal request
        // let's just return a promise that will resolve itself.
        if (NetworkStore.getSupportAuthToken() && !NetworkStore.isSupportRequest(request.command)) {
            return new Promise((resolve) => resolve());
        }
        return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure);
    });
}

/**
 * @param {Object} request
 * @param {Boolean} [isFromSequentialQueue]
 * @returns {Promise}
 */
function processWithMiddleware(request, isFromSequentialQueue = false) {
    return _.reduce(middlewares, (last, middleware) => middleware(last, request, isFromSequentialQueue), makeXHR(request));
}

/**
 * @param {Function} middleware
 */
function use(middleware) {
    middlewares.push(middleware);
}

function clearMiddlewares() {
    middlewares = [];
}

export {clearMiddlewares, processWithMiddleware, use};
