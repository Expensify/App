import CONST from '@src/CONST';
import Log from './Log';
import type {RequestError} from './Network/SequentialQueue';
import {generateRandomInt} from './NumberUtils';

class RequestThrottle {
    private requestWaitTime = 0;

    private requestRetryCount = 0;

    clear() {
        this.requestWaitTime = 0;
        this.requestRetryCount = 0;
        Log.info(`[RequestThrottle] in clear()`);
    }

    getRequestWaitTime() {
        if (this.requestWaitTime) {
            this.requestWaitTime = Math.min(this.requestWaitTime * 2, CONST.NETWORK.MAX_RETRY_WAIT_TIME_MS);
        } else {
            this.requestWaitTime = generateRandomInt(CONST.NETWORK.MIN_RETRY_WAIT_TIME_MS, CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
        }
        return this.requestWaitTime;
    }

    getLastRequestWaitTime() {
        return this.requestWaitTime;
    }

    sleep(error: RequestError, command: string): Promise<void> {
        this.requestRetryCount++;
        return new Promise((resolve, reject) => {
            if (this.requestRetryCount <= CONST.NETWORK.MAX_REQUEST_RETRIES) {
                const currentRequestWaitTime = this.getRequestWaitTime();
                Log.info(
                    `[RequestThrottle] Retrying request after error: '${error.name}', '${error.message}', '${error.status}'. Command: ${command}. Retry count:  ${this.requestRetryCount}. Wait time: ${currentRequestWaitTime}`,
                );
                setTimeout(resolve, currentRequestWaitTime);
            } else {
                reject();
            }
        });
    }
}

export default RequestThrottle;
