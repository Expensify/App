import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Log from '../Log';
import * as SequentialQueue from '../Network/SequentialQueue';
import * as App from './App';
import * as OnyxUpdates from './OnyxUpdates'

// This file is in charge of looking at the updateIDs coming from the server and comparing them to the last updateID that the client has.
// If the client is behind the server, then we need to pause everything, get the missing updates from the server, apply those updates,
// then restart everything. This will ensure that the client is up-to-date with the server and all the updates have been applied
// in the correct order.
// It's important that this file is separate and not imported by OnyxUpdates.js, so that there are no circular dependencies. Onyx
// is used as a pub/sub mechanism to break out of the circular dependencies.
// The circular dependency happen because this file calls the API GetMissingOnyxUpdates which uses the SaveResponseInOnyx.js file
// (as a middleware). Therefore, SaveResponseInOnyx.js can't import and use this file directly.



// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated
let lastUpdateIDAppliedToClient = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

export default () => {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    Onyx.connect({
        key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
        callback: (val) => {
            if (!val) {
                return;
            }

            const {lastUpdateIDFromServer, previousUpdateIDFromServer, updateParams} = val;

            // In cases where we received a previousUpdateID and it doesn't match our lastUpdateIDAppliedToClient
            // we need to perform one of the 2 possible cases:
            //
            // 1. This is the first time we're receiving an lastUpdateID, so we need to do a final reconnectApp before
            // fully migrating to the reliable updates mode;
            // 2. This this client already has the reliable updates mode enabled, but it's missing some updates and it
            // needs to fech those.
            //
            // To to both of those, we need to pause the sequential queue. This is important so that the updates are
            // applied in their correct and specific order. If this queue was not paused, then there would be a lot of
            // onyx data being applied while we are fetching the missing updates and that would put them all out of order.
            SequentialQueue.pause();
            let promise;

            // The flow below is setting the promise to a reconnect app to address flow (1) explained above.
            if (!lastUpdateIDAppliedToClient) {
                console.debug('[OnyxUpdateManager] Client has not gotten reliable updates before so reconnecting the app to start the process');
                Log.info('Client has not gotten reliable updates before so reconnecting the app to start the process');
                promise = App.lastReconnectAppAfterActivatingReliableUpdates();
            } else {
                // The flow below is setting the promise to a getMissingOnyxUpdates to address flow (2) explained above.
                console.debug(`[OnyxUpdateManager] Client is behind the server by ${previousUpdateIDFromServer - lastUpdateIDAppliedToClient} so fetching incremental updates`);
                Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                    lastUpdateIDFromServer,
                    previousUpdateIDFromServer,
                    lastUpdateIDAppliedToClient,
                });
                promise = App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, lastUpdateIDFromServer);
            }

            promise.finally(() => {
                console.debug('[OnyxUpdateManager] Done applying all updates');
                OnyxUpdates.applyOnyxUpdates(updateParams).finally(() => {
                    SequentialQueue.unpause();
                });
            });

            if (lastUpdateIDFromServer > lastUpdateIDAppliedToClient) {
                // Update this value so that it matches what was just received from the server
                Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIDFromServer || 0);
            }
        },
    });
};
