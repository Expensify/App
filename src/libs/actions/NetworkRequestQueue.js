import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let persistedRequests = [];
Onyx.connect({
    key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
    callback: val => persistedRequests = val || [],
});

function clearPersistedRequests() {
    Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, []);
}

function saveRetryableRequests(retryableRequests) {
    Onyx.merge(ONYXKEYS.NETWORK_REQUEST_QUEUE, retryableRequests);
}

function getPersistedRequests() {
    return persistedRequests;
}

export {
    clearPersistedRequests,
    saveRetryableRequests,
    getPersistedRequests,
};
