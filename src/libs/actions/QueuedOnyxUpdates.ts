import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import {QueuedOnyxUpdates} from '../../types/onyx';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: QueuedOnyxUpdates = [];
Onyx.connect({
    key: ONYXKEYS.QUEUED_ONYX_UPDATES,
    callback: (val) => (queuedOnyxUpdates = val ?? []),
});

/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates(updates: QueuedOnyxUpdates): Promise<void> {
    return Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, [...queuedOnyxUpdates, ...updates]);
}

function clear(): void {
    Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null);
}

function getQueuedUpdates(): QueuedOnyxUpdates {
    return queuedOnyxUpdates;
}

export {queueOnyxUpdates, clear, getQueuedUpdates};
