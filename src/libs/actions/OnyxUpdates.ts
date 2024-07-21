import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Merge} from 'type-fest';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import PusherUtils from '@libs/PusherUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdateEvent, OnyxUpdatesFromServer, Request} from '@src/types/onyx';
import type Response from '@src/types/onyx/Response';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as QueuedOnyxUpdates from './QueuedOnyxUpdates';

// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
let lastUpdateIDAppliedToClient: number | undefined = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

// This promise is used to ensure pusher events are always processed in the order they are received,
// even when such events are received over multiple separate pusher updates.
let pusherEventsPromise = Promise.resolve();

let airshipEventsPromise = Promise.resolve();

function applyHTTPSOnyxUpdates(request: Request, response: Response) {
    console.debug('[OnyxUpdateManager] Applying https update');
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    const updateHandler: (updates: OnyxUpdate[]) => Promise<unknown> = request?.data?.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? QueuedOnyxUpdates.queueOnyxUpdates : Onyx.update;

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
            if (request.finallyData) {
                return updateHandler(request.finallyData);
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

function applyAirshipOnyxUpdates(updates: OnyxUpdateEvent[]) {
    airshipEventsPromise = airshipEventsPromise.then(() => {
        console.debug('[OnyxUpdateManager] Applying Airship updates');
    });

    airshipEventsPromise = updates
        .reduce((promise, update) => promise.then(() => Onyx.update(update.data)), airshipEventsPromise)
        .then(() => {
            console.debug('[OnyxUpdateManager] Done applying Airship updates');
        });

    return airshipEventsPromise;
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function apply({lastUpdateID, type, request, response, updates}: Merge<OnyxUpdatesFromServer, {updates: OnyxUpdateEvent[]; type: 'pusher'}>): Promise<void>;
function apply({lastUpdateID, type, request, response, updates}: Merge<OnyxUpdatesFromServer, {request: Request; response: Response; type: 'https'}>): Promise<Response>;
function apply({lastUpdateID, type, request, response, updates}: OnyxUpdatesFromServer): Promise<Response>;
function apply({lastUpdateID, type, request, response, updates}: OnyxUpdatesFromServer): Promise<void | Response> | undefined {
    Log.info(`[OnyxUpdateManager] Applying update type: ${type} with lastUpdateID: ${lastUpdateID}`, false, {command: request?.command});

    if (lastUpdateID && lastUpdateIDAppliedToClient && Number(lastUpdateID) <= lastUpdateIDAppliedToClient) {
        Log.info('[OnyxUpdateManager] Update received was older than or the same as current state, returning without applying the updates other than successData and failureData');

        // In this case, we're already received the OnyxUpdate included in the response, so we don't need to apply it again.
        // However, we do need to apply the successData and failureData from the request
        if (
            type === CONST.ONYX_UPDATE_TYPES.HTTPS &&
            request &&
            response &&
            (!isEmptyObject(request.successData) || !isEmptyObject(request.failureData) || !isEmptyObject(request.finallyData))
        ) {
            Log.info('[OnyxUpdateManager] Applying success or failure data from request without onyxData from response');

            // We use a spread here instead of delete because we don't want to change the response for other middlewares
            const {onyxData, ...responseWithoutOnyxData} = response;
            return applyHTTPSOnyxUpdates(request, responseWithoutOnyxData);
        }

        return Promise.resolve();
    }
    if (lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.HTTPS && request && response) {
        return applyHTTPSOnyxUpdates(request, response);
    }
    if (type === CONST.ONYX_UPDATE_TYPES.PUSHER && updates) {
        return applyPusherOnyxUpdates(updates);
    }
    if (type === CONST.ONYX_UPDATE_TYPES.AIRSHIP && updates) {
        return applyAirshipOnyxUpdates(updates);
    }
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function saveUpdateInformation(updateParams: OnyxUpdatesFromServer) {
    // If we got here, that means we are missing some updates on our local storage. To
    // guarantee that we're not fetching more updates before our local data is up to date,
    // let's stop the sequential queue from running until we're done catching up.
    SequentialQueue.pause();

    // Always use set() here so that the updateParams are never merged and always unique to the request that came in
    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, updateParams);
}

/**
 * This function will receive the previousUpdateID from any request/pusher update that has it, compare to our current app state
 * and return if an update is needed
 * @param previousUpdateID The previousUpdateID contained in the response object
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 */
function doesClientNeedToBeUpdated(previousUpdateID = 0, clientLastUpdateID = 0): boolean {
    // If no previousUpdateID is sent, this is not a WRITE request so we don't need to update our current state
    if (!previousUpdateID) {
        return false;
    }

    const lastUpdateIDFromClient = clientLastUpdateID || lastUpdateIDAppliedToClient;

    // If we don't have any value in lastUpdateIDFromClient, this is the first time we're receiving anything, so we need to do a last reconnectApp
    if (!lastUpdateIDFromClient) {
        Log.info('We do not have lastUpdateIDFromClient, client needs updating');
        return true;
    }
    if (lastUpdateIDFromClient < previousUpdateID) {
        Log.info('lastUpdateIDFromClient is less than the previousUpdateID received, client needs updating', false, {lastUpdateIDFromClient, previousUpdateID});
        return true;
    }

    return false;
}

// eslint-disable-next-line import/prefer-default-export
export {apply, doesClientNeedToBeUpdated, saveUpdateInformation};
