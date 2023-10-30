import * as Request from '@libs/Request';
import OnyxRequest from '@src/types/onyx/Request';
import * as NetworkStore from './NetworkStore';
import * as SequentialQueue from './SequentialQueue';

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue: OnyxRequest[] = [];

/**
 * Checks to see if a request can be made.
 */
function canMakeRequest(request: OnyxRequest): boolean {
    // Some requests are always made even when we are in the process of authenticating (typically because they require no authToken e.g. Log, BeginSignIn)
    // However, if we are in the process of authenticating we always want to queue requests until we are no longer authenticating.
    return request.data?.forceNetworkRequest === true || (!NetworkStore.isAuthenticating() && !SequentialQueue.isRunning());
}

function push(request: OnyxRequest) {
    networkRequestQueue.push(request);
}

function replay(request: OnyxRequest) {
    push(request);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    process();
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function process() {
    if (NetworkStore.isOffline()) {
        return;
    }

    // When the queue length is empty an early return is performed since nothing needs to be processed
    if (networkRequestQueue.length === 0) {
        return;
    }

    // Some requests should be retried and will end up here if the following conditions are met:
    // - we are in the process of authenticating and the request is retryable (most are)
    // - the request does not have forceNetworkRequest === true (this will trigger it to process immediately)
    // - the request does not have shouldRetry === false (specified when we do not want to retry, defaults to true)
    const requestsToProcessOnNextRun: OnyxRequest[] = [];

    networkRequestQueue.forEach((queuedRequest) => {
        // Check if we can make this request at all and if we can't see if we should save it for the next run or chuck it into the ether
        if (!canMakeRequest(queuedRequest)) {
            const shouldRetry = queuedRequest?.data?.shouldRetry;
            if (shouldRetry) {
                requestsToProcessOnNextRun.push(queuedRequest);
            } else {
                console.debug('Skipping request that should not be re-tried: ', {command: queuedRequest.command});
            }
            return;
        }

        Request.processWithMiddleware(queuedRequest);
    });

    // We clear the request queue at the end by setting the queue to requestsToProcessOnNextRun which will either have some
    // requests we want to retry or an empty array
    networkRequestQueue = requestsToProcessOnNextRun;
}

/**
 * Clear the queue and cancels all pending requests
 * Non-cancellable requests like Log would not be cleared
 */
function clear() {
    networkRequestQueue = networkRequestQueue.filter((request) => !request.data?.canCancel);
}

function getAll(): OnyxRequest[] {
    return networkRequestQueue;
}

export {clear, replay, push, process, getAll};
