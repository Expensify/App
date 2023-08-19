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
        .then(() => responseData);
}

/**
 * @param {Object} data
 * @param {Object} data.multipleEvents
 */
function applyPusherOnyxUpdates({multipleEvents}) {
    _.each(multipleEvents, (multipleEvent) => {
        PusherUtils.triggerMultiEventHandler(multipleEvent.eventType, multipleEvent.data);
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
        applyPusherOnyxUpdates(data);
        return new Promise().resolve();
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

            // If the previous update from the server does not match the last update the client got, then the client is missing some updates.
            // getMissingOnyxUpdates will fetch updates starting from the last update this client got and going to the last update the server sent.
            if (lastUpdateIDAppliedToClient && previousUpdateIDFromServer && lastUpdateIDAppliedToClient < previousUpdateIDFromServer) {
                console.debug('[OnyxUpdateManager] Gap detected in update IDs so fetching incremental updates');
                Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                    lastUpdateIDFromServer,
                    previousUpdateIDFromServer,
                    lastUpdateIDAppliedToClient,
                });

                SequentialQueue.pause();

                App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, lastUpdateIDFromServer).finally(() => {
                    applyOnyxUpdates(updateParams).then(SequentialQueue.unpause);
                });
            } else {
                applyOnyxUpdates(updateParams);
            }

            if (lastUpdateIDFromServer > lastUpdateIDAppliedToClient) {
                // Update this value so that it matches what was just received from the server
                Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIDFromServer || 0);
            }
        },
    });
};
