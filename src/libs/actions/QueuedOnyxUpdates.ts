import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: OnyxUpdate[] = [];

/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates(updates: OnyxUpdate[]): Promise<void> {
    queuedOnyxUpdates = queuedOnyxUpdates.concat(updates);
    return Promise.resolve();
}

function flushQueue(): Promise<void> {
    return Onyx.update(queuedOnyxUpdates).then(() => {
        queuedOnyxUpdates = [];
    });
}

export {queueOnyxUpdates, flushQueue};
