import {getIsOffline} from '@libs/NetworkState';
import {processWithMiddleware} from '@libs/Request';

import type OnyxRequest from '@src/types/onyx/Request';
import type {AnyRequest} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

import {clear, getAll, push, replaceAll} from './MainQueueStore';
import {isAuthenticating} from './NetworkStore';
import {isRunning as sequentialQueueIsRunning} from './SequentialQueue';

/**
 * Checks to see if a request can be made.
 */
function canMakeRequest<TKey extends OnyxKey>(request: OnyxRequest<TKey>): boolean {
    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, BeginSignIn)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating.
    return request.data?.forceNetworkRequest === true || (!isAuthenticating() && !sequentialQueueIsRunning());
}

function replay<TKey extends OnyxKey>(request: OnyxRequest<TKey>) {
    push(request);

    process();
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function process() {
    if (getIsOffline()) {
        return;
    }

    const networkRequestQueue = getAll();

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and the request is retryable (most are)
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    // - the request does not have shouldRetry === false (specified when we do not want to retry, defaults to true)
    const requestsToProcessOnNextRun: AnyRequest[] = [];

    for (const queuedRequest of networkRequestQueue) {
        // Check if we can make this request at all and if we can't see if we should save it for the next run or chuck it into the ether
        if (!canMakeRequest(queuedRequest)) {
            const shouldRetry = queuedRequest?.data?.shouldRetry;
            if (shouldRetry) {
                requestsToProcessOnNextRun.push(queuedRequest);
            } else {
                console.debug('Skipping request that should not be re-tried: ', {command: queuedRequest.command});
            }
            continue;
        }

        processWithMiddleware(queuedRequest);
    }

    // We clear the request queue at the end by setting the queue to requestsToProcessOnNextRun which will either have some
    // requests we want to retry or an empty array
    replaceAll(requestsToProcessOnNextRun);
}

export {clear, replay, push, process, getAll};
