import CONST from '../CONST';

let requestWaitTime = 0;

function clear(): void {
    requestWaitTime = 0;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRequestWaitTime() {
    if (requestWaitTime) {
        requestWaitTime = Math.min(requestWaitTime * 2, CONST.NETWORK.MAX_RETRY_WAIT_TIME_MS);
    } else {
        requestWaitTime = getRandomInt(CONST.NETWORK.MIN_RETRY_WAIT_TIME_MS, CONST.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
    }
    return requestWaitTime;
}

function sleep(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, getRequestWaitTime()));
}

export {clear, getRequestWaitTime, sleep};
