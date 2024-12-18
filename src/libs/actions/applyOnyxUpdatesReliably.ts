import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import {handleOnyxUpdateGap} from './OnyxUpdateManager';
import * as OnyxUpdates from './OnyxUpdates';

type ApplyOnyxUpdatesReliablyOptions = {
    clientLastUpdateID?: number;
    shouldRunSync?: boolean;
};

/**
 * Checks for and handles gaps of onyx updates between the client and the given server updates before applying them
 *
 * This is in it's own lib to fix a dependency cycle from OnyxUpdateManager
 *
 * @param updates
 * @param shouldRunSync
 * @returns
 */
export default function applyOnyxUpdatesReliably(updates: OnyxUpdatesFromServer, {shouldRunSync = false, clientLastUpdateID}: ApplyOnyxUpdatesReliablyOptions = {}) {
    const fetchMissingUpdates = (shouldFetchPendingUpdates = false) => {
        if (shouldRunSync) {
            handleOnyxUpdateGap({...updates, shouldFetchPendingUpdates}, clientLastUpdateID);
        } else {
            OnyxUpdates.saveUpdateInformation({...updates, shouldFetchPendingUpdates});
        }
    };

    // If a pendingLastUpdateID is was provided, it means that the backend didn't send updates because the payload was too big.
    // In this case, we need to fetch the missing updates up to the pendingLastUpdateID.
    if (updates.shouldFetchPendingUpdates) {
        return fetchMissingUpdates(true);
    }

    const previousUpdateID = Number(updates.previousUpdateID) || 0;
    if (!OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID, clientLastUpdateID})) {
        OnyxUpdates.apply(updates);
        return;
    }

    fetchMissingUpdates();
}
