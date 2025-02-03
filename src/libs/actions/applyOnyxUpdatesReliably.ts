import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import {handleMissingOnyxUpdates} from './OnyxUpdateManager';
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
    const fetchMissingUpdates = () => {
        // If we got here, that means we are missing some updates on our local storage. To
        // guarantee that we're not fetching more updates before our local data is up to date,
        // let's stop the sequential queue from running until we're done catching up.
        SequentialQueue.pause();

        if (shouldRunSync) {
            handleMissingOnyxUpdates(updates, clientLastUpdateID);
        } else {
            OnyxUpdates.saveUpdateInformation(updates);
        }
    };

    // If a pendingLastUpdateID is was provided, it means that the backend didn't send updates because the payload was too big.
    // In this case, we need to fetch the missing updates up to the pendingLastUpdateID.
    if (updates.shouldFetchPendingUpdates) {
        fetchMissingUpdates();
        return;
    }

    const previousUpdateID = Number(updates.previousUpdateID) ?? CONST.DEFAULT_NUMBER_ID;
    if (!OnyxUpdates.doesClientNeedToBeUpdated({previousUpdateID, clientLastUpdateID})) {
        OnyxUpdates.apply(updates);
        return;
    }

    fetchMissingUpdates();
}
