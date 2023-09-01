import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Log from '../Log';
import * as SequentialQueue from '../Network/SequentialQueue';
import PusherUtils from '../PusherUtils';
import * as QueuedOnyxUpdates from './QueuedOnyxUpdates';
import * as App from './App';

// This file is in charge of looking at the updateIDs coming from the server and comparing them to the last updateID that the client has.
// If the client is behind the server, then we need to pause everything, get the missing updates from the server, apply those updates,
// then restart everything. This will ensure that the client is up-to-date with the server and all the updates have been applied
// in the correct order.
// It's important that this file is separate and not imported by OnyxUpdates.js, so that there are no circular dependencies. Onyx
// is used as a pub/sub mechanism to break out of the circular dependencies.
// The circular dependency happen because this file calls the API GetMissingOnyxUpdates which uses the SaveResponseInOnyx.js file
// (as a middleware). Therefore, SaveResponseInOnyx.js can't import and use this file directly.

/**
 * @param {Object} data
 * @param {Object} data.request
 * @param {Object} data.responseData
 * @returns {Promise}
 */
function applyHTTPSOnyxUpdates({request, responseData}) {
    console.debug('[OnyxUpdateManager] Applying https update');
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    // 2023-08-31 - 
    const updateHandler = request.data.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? QueuedOnyxUpdates.queueOnyxUpdates : Onyx.update;

    // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
    // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
    // in successData/failureData until after the component has received and API data.
    const onyxDataUpdatePromise = responseData.onyxData ? updateHandler(responseData.onyxData) : Promise.resolve();

    return onyxDataUpdatePromise
        .then(() => {
            // Handle the request's success/failure data (client-side data)
            if (responseData.jsonCode === 200 && request.successData) {
                return updateHandler(request.successData);
            }
            if (responseData.jsonCode !== 200 && request.failureData) {
                return updateHandler(request.failureData);
            }
            return Promise.resolve();
        })
        .then(() => {
            console.debug('[OnyxUpdateManager] Done applying HTTPS update');
        });
}

/**
 * @param {Object} data
 * @param {Object} data.updates
 * @returns {Promise}
 */
function applyPusherOnyxUpdates({updates}) {
    console.debug('[OnyxUpdateManager] Applying pusher update');
    const pusherEventPromises = _.reduce(
        updates,
        (result, update) => {
            result.push(PusherUtils.triggerMultiEventHandler(update.eventType, update.data));
            return result;
        },
        [],
    );
    return Promise.all(pusherEventPromises).then(() => {
        console.debug('[OnyxUpdateManager] Done applying Pusher update');
    });
}

/**
 * @param {Object[]} updateParams
 * @param {String} updateParams.type
 * @param {Object} updateParams.data
 * @param {Object} [updateParams.data.request] Exists if updateParams.type === 'https'
 * @param {Object} [updateParams.data.response] Exists if updateParams.type === 'https'
 * @param {Object} [updateParams.data.updates] Exists if updateParams.type === 'pusher'
 * @returns {Promise}
 */
function applyOnyxUpdates({type, data}) {
    console.debug(`[OnyxUpdateManager] Applying update type: ${type}`, data);
    if (type === CONST.ONYX_UPDATE_TYPES.HTTPS) {
        return applyHTTPSOnyxUpdates(data);
    }
    if (type === CONST.ONYX_UPDATE_TYPES.PUSHER) {
        return applyPusherOnyxUpdates(data);
    }
}

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

            // If we don't have a previousUpdateID from the request, or if we if it's the less or equal w we currently have stored
            // we can simply apply the updates and move on.
            if (!previousUpdateIDFromServer || lastUpdateIDAppliedToClient === previousUpdateIDFromServer) {
                console.debug(`[OnyxUpdateManager] Client is in sync with the server, applying updates`);
                applyOnyxUpdates(updateParams);
            } else if (lastUpdateIDFromServer < lastUpdateIDAppliedToClient) { 
                console.debug(`[OnyxUpdateManager] Client is more up to date than the update received, skipping processing`);
            } else {
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
                if (!lastUpdateIDAppliedToClient &&
                    (updateParams.type === CONST.ONYX_UPDATE_TYPES.PUSHER || updateParams.data.request.command !== 'OpenApp' && updateParams.data.request.command !== 'ReconnectApp')
                ) {
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
                    applyOnyxUpdates(updateParams);
                    SequentialQueue.unpause();
                });
            }

            if (lastUpdateIDFromServer > lastUpdateIDAppliedToClient) {
                // Update this value so that it matches what was just received from the server
                Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIDFromServer || 0);
            }
        },
    });
};
