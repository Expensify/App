import Onyx, {OnyxUpdate} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: OnyxUpdate[] = [];
Onyx.connect({
    key: ONYXKEYS.QUEUED_ONYX_UPDATES,
    callback: (val) => (queuedOnyxUpdates = val ?? []),
});

/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates(updates: OnyxUpdate[]): Promise<void> {
    return Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, [...queuedOnyxUpdates, ...updates]);
}

function clear() {
    Onyx.set(ONYXKEYS.QUEUED_ONYX_UPDATES, null);
}

function flushQueue(): Promise<void> {
    return Onyx.update(queuedOnyxUpdates).then(clear);
}

export {queueOnyxUpdates, flushQueue};
