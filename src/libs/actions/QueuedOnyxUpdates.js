import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let queuedOnyxUpdates = [];
Onyx.connect({
    key: ONYXKEYS.QUEUED_ONYX_UPDATES,
    callback: val => queuedOnyxUpdates = val || [],
});

/**
 * @param {Array<Object>} updates Onyx updates to queue for later
 * @returns {Promise}
 */
function queueOnyxUpdates(updates) {
    return Onyx.merge(ONYXKEYS.QUEUED_ONYX_UPDATES, updates);
}

function clear() {
    Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null);
}

/**
 * @returns {Array<Object>}
 */
function getQueuedUpdates() {
    return queuedOnyxUpdates;
}

export {
    queueOnyxUpdates,
    clear,
    getQueuedUpdates,
};
