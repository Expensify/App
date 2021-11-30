import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashUnionWith from 'lodash/unionWith';
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
    persistedRequests = lodashUnionWith(persistedRequests, retryableRequests, _.isEqual);
    Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, persistedRequests);
}

function removeRetryableRequest(request) {
    retryMap.delete(request);
    persistedRequests = _.reject(persistedRequests, r => _.isEqual(r, request));
    Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, persistedRequests);
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
