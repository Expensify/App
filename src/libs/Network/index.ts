import * as ActiveClientManager from '@libs/ActiveClientManager';

import CONST from '@src/CONST';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import {process as processMainQueue} from './MainQueue';
import {enqueue} from './MainQueueStore';
import {flush as flushSequentialQueue} from './SequentialQueue';

// React Native uses a number for the timer id, but Web/NodeJS uses a Timeout object
let processQueueInterval: NodeJS.Timeout | number;

// We must wait until the ActiveClientManager is ready so that we ensure only the "leader" tab processes any persisted requests
ActiveClientManager.isReady().then(() => {
    flushSequentialQueue();

    // Start main queue and process once every n ms delay
    processQueueInterval = setInterval(processMainQueue, CONST.NETWORK.PROCESS_REQUEST_DELAY_MS);
});

/**
 * Clear any existing intervals during test runs
 * This is to prevent previous intervals interfering with other tests
 */
function clearProcessQueueInterval() {
    if (!processQueueInterval) {
        return;
    }
    clearInterval(processQueueInterval);
}

/**
 * Perform a queued post request
 */
function post<TKey extends OnyxKey>(command: string, data: Record<string, unknown> = {}, type = CONST.NETWORK.METHOD.POST, shouldUseSecure = false): Promise<Response<TKey>> {
    const promise = enqueue<TKey>(command, data, type, shouldUseSecure);

    // This check is mainly used to prevent API commands from triggering calls to MainQueue.process() from inside the context of a previous
    // call to MainQueue.process() e.g. calling a Log command without this would cause the requests in mainQueue to double process
    // since we call Log inside MainQueue.process().
    const shouldProcessImmediately = data?.shouldProcessImmediately ?? true;
    if (shouldProcessImmediately) {
        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        processMainQueue();
    }

    return promise;
}

export {post, clearProcessQueueInterval};
