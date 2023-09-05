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

/**
 * @param {Array<Object>} updates Onyx updates to queue for later
 * @returns {Promise}
 */
function queueOnyxUpdates(updates) {
    return Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, [...queuedOnyxUpdates, ...updates]);
}

function clear() {
    Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null);
}

function internalFlush() {
    const currentFlush = queuedOnyxUpdates;
    queuedOnyxUpdates = [];

    Onyx.update(queuedOnyxUpdates)
    return Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null).then(() => isFlushing = false);
}

/**
 * @returns {Promise}
 */
function flushQueue() {

    if(isFlushing) {
        flushPromise.then(internalFlush);
    }
    isFlushing = true;
    flushPromise = internalFlush();
    return flushPromise;
}

export {queueOnyxUpdates, clear, flushQueue};
