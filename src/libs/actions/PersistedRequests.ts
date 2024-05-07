import isEqual from 'lodash/isEqual';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Request} from '@src/types/onyx';

let persistedRequests: Request[] = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => (persistedRequests = val ?? []),
});

/**
 * This promise is only used by tests. DO NOT USE THIS PROMISE IN THE APPLICATION CODE
 */
function clear() {
    return Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

function getLength(): number {
    return persistedRequests.length;
}

function save(requestToPersist: Request) {
    const requests = [...persistedRequests, requestToPersist];
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(() => {
        Log.info(`[SequentialQueue] '${requestToPersist.command}' command queued. Queue length is ${getLength()}`);
    });
}

function remove(requestToRemove: Request) {
    /**
     * We only remove the first matching request because the order of requests matters.
     * If we were to remove all matching requests, we can end up with a final state that is different than what the user intended.
     */
    const requests = [...persistedRequests];
    const index = requests.findIndex((persistedRequest) => isEqual(persistedRequest, requestToRemove));
    if (index === -1) {
        return;
    }
    requests.splice(index, 1);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests).then(() => {
        Log.info(`[SequentialQueue] '${requestToRemove.command}' removed from the queue. Queue length is ${getLength()}`);
    });
}

function update(oldRequestIndex: number, newRequest: Request) {
    const requests = [...persistedRequests];
    requests.splice(oldRequestIndex, 1, newRequest);
    persistedRequests = requests;
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, requests);
}

function getAll(): Request[] {
    return persistedRequests;
}

export {clear, save, getAll, remove, update, getLength};
