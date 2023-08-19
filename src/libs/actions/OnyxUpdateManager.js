import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Log from '../Log';
import * as SequentialQueue from '../Network/SequentialQueue';
import PusherUtils from '../PusherUtils';
import * as QueuedOnyxUpdates from './QueuedOnyxUpdates';
import * as App from './App';

// The next 40ish lines of code are used for detecting when there is a gap of OnyxUpdates between what was last applied to the client and the updates the server has.
// When a gap is detected, the missing updates are fetched from the API.

/**
 * @param {Object} data
 * @param {Object} data.request
 * @param {Object} data.responseData
 * @returns {Promise}
 */
function applyHTTPSOnyxUpdates({request, responseData}) {
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
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
 * @param {Object} data.multipleEvents
 * @returns {Promise}
 */
function applyPusherOnyxUpdates({multipleEvents}) {
    const pusherEventPromises = _.reduce(
        multipleEvents,
        (result, multipleEvent) => {
            result.push(PusherUtils.triggerMultiEventHandler(multipleEvent.eventType, multipleEvent.data));
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
 * @param {Object} [updateParams.data.multipleEvents] Exists if updateParams.type === 'pusher'
 * @returns {Promise}
 */
function applyOnyxUpdates({type, data}) {
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
            console.debug('[OnyxUpdateManager] Received lastUpdateID from server', lastUpdateIDFromServer);
            console.debug('[OnyxUpdateManager] Received previousUpdateID from server', previousUpdateIDFromServer);
            console.debug('[OnyxUpdateManager] Last update ID applied to the client', lastUpdateIDAppliedToClient);

            // This can happen when a user has just started getting reliable updates from the server but they haven't
            // had an OpenApp or ReconnectApp call yet. This can result in never getting reliable updates because
            // lastUpdateIDAppliedToClient will always be null. For this case, reconnectApp() will be triggered for them
            // to kick start the reliable updates.
            if (!lastUpdateIDAppliedToClient && previousUpdateIDFromServer > 0) {
                console.debug('[OnyxUpdateManager] Client has not gotten reliable updates before so reconnecting the app to start the process');
                App.reconnectApp();
            }

            // If the previous update from the server does not match the last update the client got, then the client is missing some updates.
            // getMissingOnyxUpdates will fetch updates starting from the last update this client got and going to the last update the server sent.
            if (lastUpdateIDAppliedToClient && previousUpdateIDFromServer && lastUpdateIDAppliedToClient < previousUpdateIDFromServer) {
                console.debug(`[OnyxUpdateManager] Client is behind the server by ${previousUpdateIDFromServer - lastUpdateIDAppliedToClient} so fetching incremental updates`);
                Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                    lastUpdateIDFromServer,
                    previousUpdateIDFromServer,
                    lastUpdateIDAppliedToClient,
                });

                // Pause the sequential queue while the missing Onyx updates are fetched from the server. This is important
                // so that the updates are applied in their correct and specific order. If this queue was not paused, then
                // there would be a lot of onyx data being applied while we are fetching the missing updates and that would
                // put them all out of order.
                SequentialQueue.pause();

                App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, lastUpdateIDFromServer).finally(() => {
                    console.debug('[OnyxUpdateManager] Done Getting missing onyx updates');

                    // The onyx update from the initial request could have been either from HTTPS or Pusher.
                    // Now that the missing onyx updates have been applied, we can apply the original onyxUpdates from
                    // the API request.
                    applyOnyxUpdates(updateParams).then(() => {
                        console.debug('[OnyxUpdateManager] Done applying all updates');

                        // Finally, the missing updates were applied, the original update was applied, and now the
                        // sequential queue is free to continue.
                        SequentialQueue.unpause();
                    });
                });
            } else {
                console.debug(`[OnyxUpdateManager] Client is in sync with the server`);
                applyOnyxUpdates(updateParams);
            }

            if (lastUpdateIDFromServer > lastUpdateIDAppliedToClient) {
                // Update this value so that it matches what was just received from the server
                Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIDFromServer || 0);
            }
        },
    });
};
