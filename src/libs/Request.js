import _ from 'underscore';
import HttpUtils from './HttpUtils';
import enhanceParameters from './Network/enhanceParameters';

const middlewares = [];

/**
 * @param {Object} request
 * @param {String} request.command
 * @param {Object} request.data
 * @param {String} request.type
 * @param {Boolean} request.shouldUseSecure
 * @returns {Promise}
 */
function call(request) {
    const finalParameters = enhanceParameters(request.command, request.data);
    return HttpUtils.xhr(request.command, finalParameters, request.type, request.shouldUseSecure);
}

/**
 * @param {Object} request
 * @param {Boolean} [isFromSequentialQueue]
 * @returns {Promise}
 */
function process(request, isFromSequentialQueue = false) {
    return _.reduce(
        middlewares,
        (last, middleware) => middleware(last, request, isFromSequentialQueue),
        call(request),
    );
}

/**
 * @param {Function} middleware
 */
function use(middleware) {
    middlewares.push(middleware);
}

export {
    process,
    use,
};
