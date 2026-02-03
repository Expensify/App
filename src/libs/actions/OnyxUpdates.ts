import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Merge} from 'type-fest';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import Performance from '@libs/Performance';
import PusherUtils from '@libs/PusherUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdateEvent, OnyxUpdatesFromServer, Request} from '@src/types/onyx';
import type Response from '@src/types/onyx/Response';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {queueOnyxUpdates} from './QueuedOnyxUpdates';

// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
let lastUpdateIDAppliedToClient: number | undefined = 0;

// We have used `connectWithoutView` here because OnyxUpdates is not connected to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

// This promise is used to ensure pusher events are always processed in the order they are received,
// even when such events are received over multiple separate pusher updates.
let pusherEventsPromise = Promise.resolve();

let airshipEventsPromise = Promise.resolve();

function applyHTTPSOnyxUpdates(request: Request, response: Response, lastUpdateID: number) {
    Performance.markStart(CONST.TIMING.APPLY_HTTPS_UPDATES);
    Log.info('[OnyxUpdateManager] Applying https update', false, {lastUpdateID});
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    const updateHandler: (updates: OnyxUpdate[]) => Promise<unknown> = request?.data?.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? queueOnyxUpdates : Onyx.update;

    // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
    // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
    // in successData/failureData until after the component has received and API data.
    const onyxDataUpdatePromise = response.onyxData
        ? updateHandler(response.onyxData).catch((error: unknown) => {
              // Sometimes we get a SQL error here if the previous queued write failed. In that case, we want to still apply the Onyx update
              // This is temporary fix until we can identify what causes SQL errors. Ideally we would only like to catch errors here.
              // Related issue - https://github.com/Expensify/App/issues/69808
              if (String(error).includes('[SqlExecutionError]') && request.command === READ_COMMANDS.OPEN_UNREPORTED_EXPENSES_PAGE && response.onyxData !== undefined) {
                  Log.warn(`${String(error)}, retrying Onyx update`);
                  return updateHandler(response.onyxData);
              }
              Log.warn(String(error));
          })
        : Promise.resolve();

    return onyxDataUpdatePromise
        .then(() => {
            // Handle the request's success/failure data (client-side data)
            if (response.jsonCode === 200 && request.successData) {
                return updateHandler(request.successData);
            }
            if (response.jsonCode !== 200 && request.failureData) {
                // 460 jsonCode in Expensify world means "admin required".
                // Typically, this would only happen if a user attempts an API command that requires policy admin access when they aren't an admin.
                // In this case, we don't want to apply failureData because it will likely result in a RedBrickRoad error on a policy field which is not accessible.
                // Meaning that there's a red dot you can't dismiss.
                if (response.jsonCode === 460) {
                    Log.info('[OnyxUpdateManager] Received 460 status code, not applying failure data');
                    return Promise.resolve();
                }
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
            Performance.markEnd(CONST.TIMING.APPLY_HTTPS_UPDATES);
            Log.info('[OnyxUpdateManager] Done applying HTTPS update', false, {lastUpdateID});
            return Promise.resolve(response);
        });
}

function applyPusherOnyxUpdates(updates: OnyxUpdateEvent[], lastUpdateID: number) {
    Performance.markStart(CONST.TIMING.APPLY_PUSHER_UPDATES);

    pusherEventsPromise = pusherEventsPromise.then(() => {
        Log.info('[OnyxUpdateManager] Applying pusher update', false, {lastUpdateID});
    });

    pusherEventsPromise = updates
        .reduce((promise, update) => promise.then(() => PusherUtils.triggerMultiEventHandler(update.eventType, update.data)), pusherEventsPromise)
        .then(() => {
            Performance.markEnd(CONST.TIMING.APPLY_PUSHER_UPDATES);
            Log.info('[OnyxUpdateManager] Done applying Pusher update', false, {lastUpdateID});
        });

    return pusherEventsPromise;
}

function applyAirshipOnyxUpdates(updates: OnyxUpdateEvent[], lastUpdateID: number) {
    Performance.markStart(CONST.TIMING.APPLY_AIRSHIP_UPDATES);

    airshipEventsPromise = airshipEventsPromise.then(() => {
        Log.info('[OnyxUpdateManager] Applying Airship updates', false, {lastUpdateID});
    });

    airshipEventsPromise = updates
        .reduce((promise, update) => promise.then(() => Onyx.update(update.data)), airshipEventsPromise)
        .then(() => {
            Performance.markEnd(CONST.TIMING.APPLY_AIRSHIP_UPDATES);
            Log.info('[OnyxUpdateManager] Done applying Airship updates', false, {lastUpdateID});
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

    const isUpdateOld = lastUpdateID && lastUpdateIDAppliedToClient && Number(lastUpdateID) < lastUpdateIDAppliedToClient;
    const isOpenAppRequest = request?.command === WRITE_COMMANDS.OPEN_APP;
    const isFullReconnectRequest = request?.command === SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP && !request?.data?.updateIDFrom;

    if (isUpdateOld && !isOpenAppRequest && !isFullReconnectRequest) {
        Log.info('[OnyxUpdateManager] Update received was older than or the same as current state, returning without applying the updates other than successData and failureData', false, {
            lastUpdateID,
            lastUpdateIDAppliedToClient,
        });

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
            return applyHTTPSOnyxUpdates(request, responseWithoutOnyxData, Number(lastUpdateID));
        }

        return Promise.resolve();
    }
    if (lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.HTTPS && request && response) {
        return applyHTTPSOnyxUpdates(request, response, Number(lastUpdateID));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.PUSHER && updates) {
        return applyPusherOnyxUpdates(updates, Number(lastUpdateID));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.AIRSHIP && updates) {
        return applyAirshipOnyxUpdates(updates, Number(lastUpdateID));
    }
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function saveUpdateInformation(updateParams: OnyxUpdatesFromServer) {
    let modifiedUpdateParams = updateParams;
    // We don't want to store the data in the updateParams if it's a HTTPS update since it is useless anyways
    // and it causes serialization issues when storing in Onyx
    if (updateParams.type === CONST.ONYX_UPDATE_TYPES.HTTPS && updateParams.request) {
        modifiedUpdateParams = {...modifiedUpdateParams, request: {...updateParams.request, data: {apiRequestType: updateParams.request?.data?.apiRequestType}}};
    }
    // Always use set() here so that the updateParams are never merged and always unique to the request that came in
    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, modifiedUpdateParams);
}

type DoesClientNeedToBeUpdatedParams = {
    clientLastUpdateID?: number;
    previousUpdateID?: number;
};

/**
 * This function will receive the previousUpdateID from any request/pusher update that has it, compare to our current app state
 * and return if an update is needed
 * @param previousUpdateID The previousUpdateID contained in the response object
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 */
function doesClientNeedToBeUpdated({previousUpdateID, clientLastUpdateID}: DoesClientNeedToBeUpdatedParams): boolean {
    // If no previousUpdateID is sent, this is not a WRITE request so we don't need to update our current state
    if (!previousUpdateID) {
        return false;
    }

    const lastUpdateIDFromClient = clientLastUpdateID ?? lastUpdateIDAppliedToClient;

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
export {apply, doesClientNeedToBeUpdated, saveUpdateInformation, applyHTTPSOnyxUpdates as INTERNAL_DO_NOT_USE_applyHTTPSOnyxUpdates};
export type {DoesClientNeedToBeUpdatedParams as ManualOnyxUpdateCheckIds};
