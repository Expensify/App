import Onyx from 'react-native-onyx';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

let isLoadingApp = false;
Onyx.connect({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = value ?? false;
    },
});

export default () => {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    Onyx.connect({
        key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
        callback: (value) => {
            // When there's no value, there's nothing to process, so let's return early.
            if (!value) {
                return;
            }
            // If isLoadingApp is positive it means that OpenApp command hasn't finished yet, and in that case
            // we don't have base state of the app (reports, policies, etc) setup. If we apply this update,
            // we'll only have them overriten by the openApp response. So let's skip it and return.
            if (isLoadingApp) {
                // When ONYX_UPDATES_FROM_SERVER is set, we pause the queue. Let's unpause
                // it so the app is not stuck forever without processing requests.
                SequentialQueue.unpause();
                console.debug(`[OnyxUpdateManager] Ignoring Onyx updates while OpenApp hans't finished yet.`);
                return;
            }
            // This key is shared across clients, thus every client/tab will have a copy and try to execute this method.
            // It is very important to only process the missing onyx updates from leader client otherwise requests we'll execute
            // several duplicated requests that are not controlled by the SequentialQueue.
            if (!ActiveClientManager.isClientTheLeader()) {
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
            let canUnpauseQueuePromise;

            // The flow below is setting the promise to a reconnect app to address flow (1) explained above.
            if (!lastUpdateIDAppliedToClient) {
                Log.info('Client has not gotten reliable updates before so reconnecting the app to start the process');

                // Since this is a full reconnectApp, we'll not apply the updates we received - those will come in the reconnect app request.
                canUnpauseQueuePromise = App.finalReconnectAppAfterActivatingReliableUpdates();
            } else {
                // The flow below is setting the promise to a getMissingOnyxUpdates to address flow (2) explained above.
                console.debug(`[OnyxUpdateManager] Client is behind the server by ${Number(previousUpdateIDFromServer) - lastUpdateIDAppliedToClient} so fetching incremental updates`);
                Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                    lastUpdateIDFromServer,
                    previousUpdateIDFromServer,
                    lastUpdateIDAppliedToClient,
                });
                canUnpauseQueuePromise = App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, previousUpdateIDFromServer);
            }

            canUnpauseQueuePromise.finally(() => {
                OnyxUpdates.apply(updateParams).finally(() => {
                    console.debug('[OnyxUpdateManager] Done applying all updates');
                    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
                    SequentialQueue.unpause();
                });
            });
        },
    });
};
