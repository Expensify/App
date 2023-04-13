import _ from 'underscore';
import CONST from '../CONST';

let requestWaitTime = 0;

function clear() {
    requestWaitTime = 0;
}

/**
 * @returns {Number} time to wait in ms
 */
function getRequestWaitTime() {
    if (requestWaitTime) {
        requestWaitTime = Math.min(requestWaitTime * 2, CONST.NETWORK.MAX_RETRY_WAIT_TIME_MS);
    } else {
        requestWaitTime = _.random(CONST.NETWORK.MIN_RETRY_WAIT_TIME_MS, CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
    }
    return requestWaitTime;
}

/**
 * @returns {Promise}
 */
function sleep() {
    return new Promise((resolve) => setTimeout(resolve, getRequestWaitTime()));
}

export {clear, getRequestWaitTime, sleep};
