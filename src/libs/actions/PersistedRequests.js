import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';

let persistedRequestMap = new Map();

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (requests) => {
        persistedRequestMap = new Map();
        _.each(requests, request => persistedRequestMap.set(request.id, request));
    },
});

/**
 * @returns {Array}
 */
function getAll() {
    return Array.from(persistedRequestMap.values());
}

function clear() {
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * @param {Object} requestToPersist
 */
function save(requestToPersist) {
    persistedRequestMap.set(requestToPersist.id, requestToPersist);
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, getAll());
}

/**
 * @param {Object} requestToRemove
 */
function remove(requestToRemove) {
    persistedRequestMap.delete(requestToRemove.id);
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, getAll());
}

export {
    clear,
    save,
    getAll,
    remove,
};
