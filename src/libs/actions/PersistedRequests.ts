import isEqual from 'lodash/isEqual';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

let persistedRequests: Request[] = [];
let ongoingRequest: Request | null = null;

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => {
        console.log('ReconnectApp PERSISTED_REQUESTS val', {...val}, ongoingRequest);
        // it has the ongoingRequest in here?
        persistedRequests = val ?? [];

        if (ongoingRequest && persistedRequests.length > 0) {
            const elem = {...persistedRequests}[0];
            console.log('First persistedRequests', elem, ' are equals: ', isEqual(elem, ongoingRequest));
            // here we try to remove the first element from the persistedRequests if it is the same as ongoingRequest
            if (isEqual(elem, ongoingRequest)) {
                console.log('First persistedRequests is equal to ongoingRequest');
                persistedRequests = persistedRequests.slice(1);
            }
        }
    },
});

/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    ongoingRequest = null;
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

function getLength(): number {
    // Making it backwards compatible with the old implementation
    return persistedRequests.length + (ongoingRequest ? 1 : 0);
}

function save(requestToPersist: Request) {
    // If the command is not in the keepLastInstance array, add the new request as usual
    const requests = [...persistedRequests, requestToPersist];
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(() => {
        Log.info(`[SequentialQueue] '${requestToPersist.command}' command queued. Queue length is ${getLength()}`);
    });
}

function remove(requestToRemove: Request) {
    console.log('remove requestToRemove - init>', {...requestToRemove});
    if (isEqual(ongoingRequest, requestToRemove)) {
        console.log('remove ongoingRequest', {...ongoingRequest});
        ongoingRequest = null;
    } else {
        /**
         * We only remove the first matching request because the order of requests matters.
         * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
         */
        const requests = [...persistedRequests];
        const index = requests.findIndex((persistedRequest) => isEqual(persistedRequest, requestToRemove));
        console.log('current queue: ', requests, 'remove index', index);
        if (index === -1) {
            return;
        }
        requests.splice(index, 1);
        persistedRequests = requests;
    }
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests).then(() => {
        Log.info(`[SequentialQueue] '${requestToRemove.command}' removed from the queue. Queue length is ${getLength()}`);
    });
}

function update(oldRequestIndex: number, newRequest: Request) {
    console.log(`${newRequest.command} oldRequestIndex`, oldRequestIndex);
    const requests = [...persistedRequests];
    console.log(`${newRequest.command} before requests`, {...requests});
    requests.splice(oldRequestIndex, 1, newRequest);
    console.log(`${newRequest.command} after requests`, {...requests});
    persistedRequests = requests;
    console.log(`${newRequest.command} persistedRequests`, {...persistedRequests});
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function updateOngoingRequest(newRequest: Request) {
    ongoingRequest = newRequest;
}

function processNextRequest(): Request {
    // You must handle the case where there are no requests to process
    if (persistedRequests.length === 0) {
        throw new Error('No requests to process');
    }

    // At least for now, you must handle the case where there is an ongoing request
    if (ongoingRequest) {
        throw new Error('There is already an ongoing request');
    }
    ongoingRequest = persistedRequests[0];
    persistedRequests = persistedRequests.slice(1);
    // We don't need to update Onyx persistedRequests just in case the ongoingRequest fails
    // we want to keep trying if the user closes the app
    return ongoingRequest;
}

function getAll(): Request[] {
    console.log('getAll persistedRequests', {...persistedRequests});
    return persistedRequests;
}

function getOngoingRequest(): Request | null {
    return ongoingRequest;
}

export {clear, save, getAll, remove, update, getLength, getOngoingRequest, processNextRequest, updateOngoingRequest};
