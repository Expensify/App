import _ from 'underscore';
import CONST from '../CONST';

export default class RequestThrottle {
    constructor() {
        this.waitTime = 0;
    }

    clear() {
        this.waitTime = 0;
    }

    /**
     * @returns {Number} time to wait in ms
     */
    getRequestWaitTime() {
        if (this.waitTime) {
            this.waitTime = Math.min(this.waitTime * 2, CONST.NETWORK.MAX_RETRY_WAIT_TIME);
        } else {
            this.waitTime = CONST.NETWORK.MIN_RETRY_WAIT_TIME + _.random(CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME - CONST.NETWORK.MIN_RETRY_WAIT_TIME);
        }
        return this.waitTime;
    }

    /**
     * @param {Number} time
     * @returns {Promise}
     */
    sleep() {
        return new Promise(resolve => setTimeout(resolve, this.getRequestWaitTime()));
    }
}
