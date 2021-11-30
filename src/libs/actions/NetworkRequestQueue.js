import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const retryMap = new Map();
let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
    callback: val => persistedRequests = val || [],
});

function clearPersistedRequests() {
    Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, []);
    retryMap.clear();
}

function saveRetryableRequests(retryableRequests) {
    Onyx.merge(ONYXKEYS.NETWORK_REQUEST_QUEUE, retryableRequests);
}

function removeRetryableRequest(request) {
    retryMap.delete(request);
    console.debug('Remove from storage: ', {request});
}

function incrementRetries(request) {
    const current = retryMap.get(request) || 0;
    const next = current + 1;
    retryMap.set(request, next);

    return next;
}

function getPersistedRequests() {
    return persistedRequests;
}

export {
    clearPersistedRequests,
    saveRetryableRequests,
    getPersistedRequests,
    removeRetryableRequest,
    incrementRetries,
};
