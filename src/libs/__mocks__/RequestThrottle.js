const initialRequestWaitTime = 50;
const OriginalRequestThrottle = jest.requireActual('../RequestThrottle');
class RequestThrottle extends OriginalRequestThrottle.default {
    constructor() {
        super();
        this.waitTime = initialRequestWaitTime;
        this.isFirstRetry = true;
    }

    getRequestWaitTime() {
        // Use the mocked initialRequestWaitTime for the first retry instead of doubling
        if (this.isFirstRetry) {
            this.isFirstRetry = false;
            return this.waitTime;
        }
        super.getRequestWaitTime();
    }
}
export default RequestThrottle;
export {
    initialRequestWaitTime,
};
