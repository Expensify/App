import CONST from '@src/CONST';
import {generateRandomInt} from './NumberUtils';

// Maximum cumulative wait time for retries in milliseconds before giving up on a request retry
const MAX_CUMULATIVE_WAIT_TIME_MS = 10000;

// Cooldown period in milliseconds to reset the cumulative wait time after it has been exceeded
const CLEAR_RETRY_TOTAL_TIME_COOLDOWN = 10000;

let requestWaitTime = 0;
let requestRetryCount = 0;
let requestRetryTotalTime = 0;
let coolDownTimeoutId: null | ReturnType<typeof setTimeout> = null;

function clear() {
    requestWaitTime = 0;
    requestRetryCount = 0;
}

function clearRequestRetryTotalTime() {
    requestRetryTotalTime = 0;
    coolDownTimeoutId = null;
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
        if (requestRetryCount > CONST.NETWORK.MAX_REQUEST_RETRIES) {
            reject(new Error('Exceeded maximum request retries'));
            return;
        }

        const waitTime = getRequestWaitTime();
        requestRetryTotalTime += waitTime;

        if (requestRetryCount > 1 && requestRetryTotalTime > MAX_CUMULATIVE_WAIT_TIME_MS) {
            if (!coolDownTimeoutId) {
                coolDownTimeoutId = setTimeout(clearRequestRetryTotalTime, CLEAR_RETRY_TOTAL_TIME_COOLDOWN);
            }
            reject(new Error('Exceeded maximum cumulative wait time'));
            return;
        }
        setTimeout(resolve, waitTime);
    });
}

// TODO remove before merging
function sleepOld(): Promise<void> {
    requestRetryCount++;
    return new Promise((resolve, reject) => {
        if (requestRetryCount <= CONST.NETWORK.MAX_REQUEST_RETRIES) {
            setTimeout(resolve, getRequestWaitTime());
            return;
        }
        reject();
    });
}

export {clear, getRequestWaitTime, sleep, getLastRequestWaitTime, sleepOld};
