import _ from 'underscore';
import HttpUtils from './HttpUtils';
import enhanceParameters from './Network/enhanceParameters';
import * as NetworkStore from './Network/NetworkStore';
import * as Report from './actions/Report';
import * as PersistedRequests from './actions/PersistedRequests';
import CONST from '../CONST';

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
    return NetworkStore.hasReadRequiredDataFromStorage()
        .then(() => HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure));
}

/**
 * @param {*} request
 * @returns {Boolean}
 */
function isRedundant(request) {
    return Report.checkRedundantRequest(request);
}

/**
 * @param {Object} request
 * @param {Boolean} [isFromSequentialQueue]
 * @returns {Promise}
 */
function processWithMiddleware(request, isFromSequentialQueue = false) {
    // Certain write requests can be cancelled if they were made offline
    // e.g. if the same comment was added/deleted while offline
    if (request.data.apiRequestType === CONST.API_REQUEST_TYPE.WRITE && isRedundant(request)) {
        PersistedRequests.remove(request);
        return Promise.resolve();
    }
    return _.reduce(
        middlewares,
        (last, middleware) => middleware(last, request, isFromSequentialQueue),
        makeXHR(request),
    );
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

export {
    clearMiddlewares,
    processWithMiddleware,
    use,
};
