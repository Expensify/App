import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashUnionWith from 'lodash/unionWith';
import ONYXKEYS from '../../ONYXKEYS';
import RetryCounter from '../RetryCounter';

const persistedRequestsRetryCounter = new RetryCounter();
let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: val => persistedRequests = val || [],
});

function clear() {
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
    persistedRequestsRetryCounter.clear();
}

/**
 * @param {Array} requestsToPersist
 */
function save(requestsToPersist) {
    persistedRequests = lodashUnionWith(persistedRequests, requestsToPersist, _.isEqual);
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @param {Object} requestToRemove
 */
function remove(requestToRemove) {
    persistedRequestsRetryCounter.remove(requestToRemove);
    persistedRequests = _.reject(persistedRequests, persistedRequest => _.isEqual(persistedRequest, requestToRemove));
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @returns {Array}
 */
function getAll() {
    return persistedRequests;
}

/**
 * @param {Object} request
 * @returns {Number}
 */
function incrementRetries(request) {
    return persistedRequestsRetryCounter.incrementRetries(request);
}

export {
    clear,
    save,
    getAll,
    remove,
    incrementRetries,
};
