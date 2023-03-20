import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import HttpUtils from '../HttpUtils';

let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: val => persistedRequests = val || [],
});

function clear() {
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * @param {Array} requestsToPersist
 */
function save(requestsToPersist) {
    HttpUtils.cancelPendingReconnectAppRequests();
    persistedRequests = _.chain(persistedRequests)
        .concat(requestsToPersist)
        .partition(request => request.command !== 'ReconnectApp')
        .flatten()
        .value();
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @param {Object} requestToRemove
 */
function remove(requestToRemove) {
    persistedRequests = _.reject(persistedRequests, persistedRequest => _.isEqual(persistedRequest, requestToRemove));
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @returns {Array}
 */
function getAll() {
    return persistedRequests;
}

export {
    clear,
    save,
    getAll,
    remove,
};
