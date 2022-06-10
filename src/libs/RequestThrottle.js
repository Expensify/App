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
            this.waitTime = Math.min(this.waitTime * 2, 10000);
        } else {
            this.waitTime = 10 + _.random(90);
        }
        return this.waitTime;
    }

    /**
     * @param {Number} time
     * @returns {Promise}
     */
    sleep() {
        const wait = this.getRequestWaitTime();
        console.log('sleeping', wait);
        return new Promise(resolve => setTimeout(resolve, wait));
    }
}
