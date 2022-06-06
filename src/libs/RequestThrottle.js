import _ from 'underscore';

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
            return Math.min(this.waitTime * 2, 10000);
        }
        return 10 + _.random(90);
    }

    /**
     * @param {Number} time
     * @returns {Promise}
     */
    sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
}
