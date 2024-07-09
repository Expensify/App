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
export default function applyOnyxUpdatesReliably(updates: OnyxUpdatesFromServer, shouldRunSync = false, clientLastUpdateID = 0) {
    const previousUpdateID = Number(updates.previousUpdateID) || 0;
    if (!OnyxUpdates.doesClientNeedToBeUpdated(previousUpdateID, clientLastUpdateID)) {
        OnyxUpdates.apply(updates);
        return;
    }

    if (shouldRunSync) {
        handleOnyxUpdateGap(updates, clientLastUpdateID);
    } else {
        OnyxUpdates.saveUpdateInformation(updates);
    }
}
