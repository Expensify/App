import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashUnionWith from 'lodash/unionWith';
import ONYXKEYS from '../../ONYXKEYS';

let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: val => persistedRequests = val || [],
});

function clear() {
    console.log('clearing');
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * @param {Array} requestsToPersist
 */
function save(requestsToPersist) {
    console.log('adding', requestsToPersist);
    persistedRequests = lodashUnionWith(persistedRequests, requestsToPersist, _.isEqual);
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @param {Object} requestToRemove
 */
function remove(requestToRemove) {
    console.log('removing', requestToRemove);
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
