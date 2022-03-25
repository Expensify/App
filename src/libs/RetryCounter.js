export default class RetryCounter {
    constructor() {
        this.retryMap = new Map();
    }

    clear() {
        this.retryMap.clear();
    }

    /**
     * @param {Object} request
     * @returns {Number} retry count
     */
    incrementRetries(request) {
        const current = this.retryMap.get(request) || 0;
        const next = current + 1;
        this.retryMap.set(request, next);
        return next;
    }

    /**
     * @param {Object} request
     */
    remove(request) {
        this.retryMap.delete(request);
    }
}
