import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let isFlushing = false;
let flushPromise;
let queuedOnyxUpdates = [];
Onyx.connect({
    key: ONYXKEYS.QUEUED_ONYX_UPDATES,
    callback: (val) => (queuedOnyxUpdates = val || []),
});

function clear() {
    Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null);
}

/**
 * @returns {Promise}
 */
function flushQueue() {
    return Onyx.update(queuedOnyxUpdates).then(clear);
}

export {flushQueue};
