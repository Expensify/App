import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import * as App from './App';
import * as OnyxUpdates from './OnyxUpdates';

// This file is in charge of looking at the updateIDs coming from the server and comparing them to the last updateID that the client has.
// If the client is behind the server, then we need to
// 1. Pause all sequential queue requests
// 2. Pause all Onyx updates from Pusher
// 3. Get the missing updates from the server
// 4. Apply those updates
// 5. Apply the original update that triggered this request (it could have come from either HTTPS or Pusher)
// 6. Restart the sequential queue
// 7. Restart the Onyx updates from Pusher
// This will ensure that the client is up-to-date with the server and all the updates have been applied in the correct order.
// It's important that this file is separate and not imported by OnyxUpdates.js, so that there are no circular dependencies. Onyx
// is used as a pub/sub mechanism to break out of the circular dependency.
// The circular dependency happens because this file calls API.GetMissingOnyxUpdates() which uses the SaveResponseInOnyx.js file
// (as a middleware). Therefore, SaveResponseInOnyx.js can't import and use this file directly.

let lastUpdateIDAppliedToClient: number | null = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => (lastUpdateIDAppliedToClient = value),
});

let deferedUpdateBeforeReconnect: OnyxUpdatesFromServer | undefined;
let deferredUpdates: OnyxUpdatesFromServer[] = [];

export default () => {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    Onyx.connect({
        key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
        callback: (value) => {
            if (!value) {
                return;
            }

            // Since we used the same key that used to store another object, let's confirm that the current object is
            // following the new format before we proceed. If it isn't, then let's clear the object in Onyx.
            if (
                !(typeof value === 'object' && !!value) ||
                !('type' in value) ||
                (!(value.type === CONST.ONYX_UPDATE_TYPES.HTTPS && value.request && value.response) &&
                    !((value.type === CONST.ONYX_UPDATE_TYPES.PUSHER || value.type === CONST.ONYX_UPDATE_TYPES.AIRSHIP) && value.updates))
            ) {
                console.debug('[OnyxUpdateManager] Invalid format found for updates, cleaning and unpausing the queue');
                Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
                SequentialQueue.unpause();
                return;
            }

            const updateParams = value;
            const lastUpdateIDFromServer = value.lastUpdateID;
            const previousUpdateIDFromServer = value.previousUpdateID;

            // In cases where we received a previousUpdateID and it doesn't match our lastUpdateIDAppliedToClient
            // we need to perform one of the 2 possible cases:
            //
            // 1. This is the first time we're receiving an lastUpdateID, so we need to do a final reconnectApp before
            // fully migrating to the reliable updates mode.
            // 2. This client already has the reliable updates mode enabled, but it's missing some updates and it
            // needs to fetch those.
            //
            // For both of those, we need to pause the sequential queue. This is important so that the updates are
            // applied in their correct and specific order. If this queue was not paused, then there would be a lot of
            // onyx data being applied while we are fetching the missing updates and that would put them all out of order.
            SequentialQueue.pause();
            let canUnpauseQueuePromise;

            // The flow below is setting the promise to a reconnect app to address flow (1) explained above.
            if (!lastUpdateIDAppliedToClient) {
                Log.info('Client has not gotten reliable updates before so reconnecting the app to start the process');

                deferedUpdateBeforeReconnect = updateParams;

                // Since this is a full reconnectApp, we'll not apply the updates we received - those will come in the reconnect app request.
                canUnpauseQueuePromise = App.finalReconnectAppAfterActivatingReliableUpdates();
            } else {
                // The flow below is setting the promise to a getMissingOnyxUpdates to address flow (2) explained above.

                // Get the number of deferred updates before adding the new one
                const existingDeferredUpdatesCount = deferredUpdates.length;
                // Add the new update to the deferred updates
                deferredUpdates.push(updateParams);

                // If there are already deferred updates, then we don't need to fetch the missing updates again
                if (existingDeferredUpdatesCount > 0) {
                    return;
                }

                console.debug(`[OnyxUpdateManager] Client is behind the server by ${Number(previousUpdateIDFromServer) - lastUpdateIDAppliedToClient} so fetching incremental updates`);
                Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                    lastUpdateIDFromServer,
                    previousUpdateIDFromServer,
                    lastUpdateIDAppliedToClient,
                });

                // Get the missing Onyx updates from the server
                canUnpauseQueuePromise = App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, previousUpdateIDFromServer);
            }

            // This function will apply the deferred updates in order after the missing updates are fetched
            function applyDeferredUpdates() {
                // If lastUpdateIDAppliedToClient is null, then no updates were applied,
                // therefore something must have gone wrong and we should handle the problem.
                if (!lastUpdateIDAppliedToClient) {
                    // TODO: Handle this case
                    return;
                }

                function unpauseQueueAndReset() {
                    console.debug('[OnyxUpdateManager] Done applying all updates');
                    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
                    SequentialQueue.unpause();
                }

                // If "updateAfterReconnectApp" is set, it means that case (1) was triggered and we only need to apply the one update, not the deferred ones.
                if (deferedUpdateBeforeReconnect) {
                    OnyxUpdates.apply(deferedUpdateBeforeReconnect).finally(unpauseQueueAndReset);
                    deferedUpdateBeforeReconnect = undefined;
                    return;
                }

                // If case (2) was triggered, then we need to sort the deferred updates by lastUpdateID and apply them in order.
                const sortedDeferredUpdates = deferredUpdates.sort((a, b) => {
                    const aLastUpdateID = Number(a.lastUpdateID) || 0;
                    const bLastUpdateID = Number(b.lastUpdateID) || 0;

                    return aLastUpdateID - bLastUpdateID;
                });

                // In order for the updates to be applied correctly in order, we need to check
                // if there are any gaps in the updates that we received from the server +
                // the deferred ones that were pushed before.
                function validateDeferredUpdates(): boolean {
                    const earliestDeferredUpdateId = Number(sortedDeferredUpdates[0].lastUpdateID) || 0;

                    if (lastUpdateIDAppliedToClient >= earliestDeferredUpdateId) {
                        console.error("The client's lastUpdateID is greater than or equal to the earliest deferred update's lastUpdateID");

                        return false;
                    }

                    return true;
                }

                //  If we detect a gap in the fetched + deferred updates, re-fetch the missing updates
                if (!validateDeferredUpdates()) {
                    canUnpauseQueuePromise = App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, previousUpdateIDFromServer).finally(applyDeferredUpdates);
                    return;
                }

                console.log({sortedDeferredUpdates});

                Promise.all(sortedDeferredUpdates.map((update) => OnyxUpdates.apply(update))).finally(() => {
                    unpauseQueueAndReset();
                    deferredUpdates = [];
                });
            }

            canUnpauseQueuePromise.finally(applyDeferredUpdates);
        },
    });
};
