import Onyx, {OnyxEntry} from 'react-native-onyx';
import {Merge} from 'type-fest';
import PusherUtils from '@libs/PusherUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {OnyxUpdateEvent, OnyxUpdatesFromServer, Request} from '@src/types/onyx';
import Response from '@src/types/onyx/Response';
import * as QueuedOnyxUpdates from './QueuedOnyxUpdates';

// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
let lastUpdateIDAppliedToClient: OnyxEntry<number> = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

// This promise is used to ensure pusher events are always processed in the order they are received,
// even when such events are received over multiple separate pusher updates.
let pusherEventsPromise = Promise.resolve();

function applyHTTPSOnyxUpdates(request: Request, response: Response) {
    console.debug('[OnyxUpdateManager] Applying https update');
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    const updateHandler = request?.data?.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? QueuedOnyxUpdates.queueOnyxUpdates : Onyx.update;

    // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
    // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
    // in successData/failureData until after the component has received and API data.
    const onyxDataUpdatePromise = response.onyxData ? updateHandler(response.onyxData) : Promise.resolve();

    return onyxDataUpdatePromise
        .then(() => {
            // Handle the request's success/failure data (client-side data)
            if (response.jsonCode === 200 && request.successData) {
                return updateHandler(request.successData);
            }
            if (response.jsonCode !== 200 && request.failureData) {
                return updateHandler(request.failureData);
            }
            return Promise.resolve();
        })
        .then(() => {
            console.debug('[OnyxUpdateManager] Done applying HTTPS update');
            return Promise.resolve(response);
        });
}

function applyPusherOnyxUpdates(updates: OnyxUpdateEvent[]) {
    pusherEventsPromise = pusherEventsPromise.then(() => {
        console.debug('[OnyxUpdateManager] Applying pusher update');
    });

    pusherEventsPromise = updates
        .reduce((promise, update) => promise.then(() => PusherUtils.triggerMultiEventHandler(update.eventType, update.data)), pusherEventsPromise)
        .then(() => {
            console.debug('[OnyxUpdateManager] Done applying Pusher update');
        });

    return pusherEventsPromise;
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function apply({lastUpdateID, type, request, response, updates}: Merge<OnyxUpdatesFromServer, {updates: OnyxUpdateEvent[]; type: 'pusher'}>): Promise<void>;
function apply({lastUpdateID, type, request, response, updates}: Merge<OnyxUpdatesFromServer, {request: Request; response: Response; type: 'https'}>): Promise<Response>;
function apply({lastUpdateID, type, request, response, updates}: OnyxUpdatesFromServer): Promise<void | Response> | undefined {
    console.debug(`[OnyxUpdateManager] Applying update type: ${type} with lastUpdateID: ${lastUpdateID}`, {request, response, updates});

    if (lastUpdateID && lastUpdateIDAppliedToClient && Number(lastUpdateID) < lastUpdateIDAppliedToClient) {
        console.debug('[OnyxUpdateManager] Update received was older than current state, returning without applying the updates');
        return Promise.resolve();
    }
    if (lastUpdateID && (lastUpdateIDAppliedToClient === null || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.HTTPS && request && response) {
        return applyHTTPSOnyxUpdates(request, response);
    }
    if (type === CONST.ONYX_UPDATE_TYPES.PUSHER && updates) {
        return applyPusherOnyxUpdates(updates);
    }
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function saveUpdateInformation(updateParams: OnyxUpdatesFromServer) {
    // Always use set() here so that the updateParams are never merged and always unique to the request that came in
    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, updateParams);
}

/**
 * This function will receive the previousUpdateID from any request/pusher update that has it, compare to our current app state
 * and return if an update is needed
 * @param previousUpdateID The previousUpdateID contained in the response object
 */
function doesClientNeedToBeUpdated(previousUpdateID = 0): boolean {
    // If no previousUpdateID is sent, this is not a WRITE request so we don't need to update our current state
    if (!previousUpdateID) {
        return false;
    }

    // If we don't have any value in lastUpdateIDAppliedToClient, this is the first time we're receiving anything, so we need to do a last reconnectApp
    if (!lastUpdateIDAppliedToClient) {
        return true;
    }

    return lastUpdateIDAppliedToClient < previousUpdateID;
}

// eslint-disable-next-line import/prefer-default-export
export {saveUpdateInformation, doesClientNeedToBeUpdated, apply};
