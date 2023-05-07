import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates = [];
let isLoggingOut;

Onyx.connect({
    key: ONYXKEYS.QUEUED_ONYX_UPDATES,
    callback: (val) => {
        queuedOnyxUpdates = val || [];
    },
});

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        isLoggingOut = lodashGet(session, 'isLoggingOut');
    },
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
    if (isLoggingOut) { return []; }
    return queuedOnyxUpdates;
}

export {
    queueOnyxUpdates,
    clear,
    getQueuedUpdates,
};
