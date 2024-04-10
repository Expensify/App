import * as SequentialQueue from '@libs/Network/SequentialQueue';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import {handleOnyxUpdateGap} from './OnyxUpdateManager';
import * as OnyxUpdates from './OnyxUpdates';

/**
 * Checks for and handles gaps of onyx updates between the client and the given server updates before applying them
 *
 * This is in it's own lib to fix a dependency cycle from OnyxUpdateManager
 *
 * @param updates
 * @param shouldRunSync
 * @returns
 */
export default function applyOnyxUpdatesReliably(updates: OnyxUpdatesFromServer, shouldRunSync = false) {
    const previousUpdateID = Number(updates.previousUpdateID) || 0;
    if (!OnyxUpdates.doesClientNeedToBeUpdated(previousUpdateID)) {
        OnyxUpdates.apply(updates);
        return;
    }

    if (shouldRunSync) {
        handleOnyxUpdateGap(updates);
        return;
    }

    // If we reached this point, we need to pause the queue while we prepare to fetch older OnyxUpdates.
    SequentialQueue.pause();
    OnyxUpdates.saveUpdateInformation(updates);
}
