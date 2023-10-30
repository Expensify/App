import CONST from '@src/CONST';
import {generateRandomInt} from './NumberUtils';

let requestWaitTime = 0;
let requestRetryCount = 0;

function clear() {
    requestWaitTime = 0;
    requestRetryCount = 0;
}

function getRequestWaitTime() {
    if (requestWaitTime) {
        requestWaitTime = Math.min(requestWaitTime * 2, CONST.NETWORK.MAX_RETRY_WAIT_TIME_MS);
    } else {
        requestWaitTime = generateRandomInt(CONST.NETWORK.MIN_RETRY_WAIT_TIME_MS, CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
    }
    return requestWaitTime;
}

function getLastRequestWaitTime() {
    return requestWaitTime;
}

function sleep(): Promise<void> {
    requestRetryCount++;
    return new Promise((resolve, reject) => {
        if (requestRetryCount <= CONST.NETWORK.MAX_REQUEST_RETRIES) {
            return setTimeout(resolve, getRequestWaitTime());
        }
        return reject();
    });
}

export {clear, getRequestWaitTime, sleep, getLastRequestWaitTime};
