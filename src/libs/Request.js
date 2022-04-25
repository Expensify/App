import _ from 'underscore';
import CONST from '../CONST';
import * as Network from './Network';

const middlewares = [];

/**
 * @param {String} commandName
 * @param {Object} parameters
 * @param {Boolean} [shouldUseSecure]
 * @returns {Promise}
 */
function call(commandName, parameters = {}, shouldUseSecure = false) {
    return _.reduce(middlewares, (last, middleware) => middleware(last), Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, shouldUseSecure));
}

/**
 * @param {Function} middleware
 */
function use(middleware) {
    middlewares.push(middleware);
}

export {
    call,
    use,
};
