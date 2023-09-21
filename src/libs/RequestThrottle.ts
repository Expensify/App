import CONST from '../CONST';
import {generateRandomInt} from './NumberUtils';

let requestWaitTime = 0;

function clear() {
    requestWaitTime = 0;
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
    return new Promise((resolve) => setTimeout(resolve, getRequestWaitTime()));
}

export {clear, getRequestWaitTime, sleep, getLastRequestWaitTime};
