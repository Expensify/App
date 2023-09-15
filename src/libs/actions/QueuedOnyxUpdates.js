import Onyx from 'react-native-onyx';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates.
let queuedOnyxUpdates = [];

/**
 * @param {Array<Object>} updates Onyx updates to queue for later
 * @returns {Promise<void>}
 */
function queueOnyxUpdates(updates) {
    queuedOnyxUpdates = queuedOnyxUpdates.concat(updates);
    return Promise.resolve();
}

function clear() {
    queuedOnyxUpdates = [];
}

/**
 * @returns {Promise}
 */
function flushQueue() {
    return Onyx.update(queuedOnyxUpdates).then(clear);
}

export {queueOnyxUpdates, flushQueue};
