import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import type {FetchMissingUpdatesIds} from './OnyxUpdateManager';
import {handleOnyxUpdateGap} from './OnyxUpdateManager';
import * as OnyxUpdates from './OnyxUpdates';

type ApplyOnyxUpdatesReliablyOptions = FetchMissingUpdatesIds & {
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
export default function applyOnyxUpdatesReliably(
    updates: OnyxUpdatesFromServer,
    {shouldRunSync = false, clientLastUpdateID, shouldFetchPendingUpdates: shouldFetchPendingUpdatesProp = false}: ApplyOnyxUpdatesReliablyOptions = {},
) {
    const fetchMissingUpdates = (shouldFetchPendingUpdates = false) => {
        if (shouldRunSync) {
            handleOnyxUpdateGap(updates, {clientLastUpdateID, shouldFetchPendingUpdates});
        } else {
            OnyxUpdates.saveUpdateInformation({...updates, shouldFetchPendingUpdates});
        }
    };

    // If a pendingLastUpdateID is was provided, it means that the backend didn't send updates because the payload was too big.
    // In this case, we need to fetch the missing updates up to the pendingLastUpdateID.
    const shouldFetchPendingUpdates = shouldFetchPendingUpdatesProp && updates == null;
    if (shouldFetchPendingUpdatesProp) {
        return fetchMissingUpdates(shouldFetchPendingUpdates);
    }

    const previousUpdateID = Number(updates.previousUpdateID) || 0;
    if (!OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID, clientLastUpdateID})) {
        OnyxUpdates.apply(updates);
        return;
    }

    fetchMissingUpdates();
}
