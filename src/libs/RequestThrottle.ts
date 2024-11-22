import CONST from '@src/CONST';
import Log from './Log';
import type {RequestError} from './Network/SequentialQueue';
import {generateRandomInt} from './NumberUtils';

let requestWaitTime = 0;
let requestRetryCount = 0;

function clear() {
    requestWaitTime = 0;
    requestRetryCount = 0;
    Log.info(`[RequestThrottle] in clear()`);
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

function sleep(error: RequestError, command: string): Promise<void> {
    requestRetryCount++;
    return new Promise((resolve, reject) => {
        if (requestRetryCount <= CONST.NETWORK.MAX_REQUEST_RETRIES) {
            const currentRequestWaitTime = getRequestWaitTime();
            Log.info(
                `[RequestThrottle] Retrying request after error: '${error.name}', '${error.message}', '${error.status}'. Command: ${command}. Retry count:  ${requestRetryCount}. Wait time: ${currentRequestWaitTime}`,
            );
            setTimeout(resolve, currentRequestWaitTime);
            return;
        }
        reject();
    });
}

export {clear, getRequestWaitTime, sleep, getLastRequestWaitTime};
