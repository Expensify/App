import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import PusherUtils from '@libs/PusherUtils';
import {trackExpenseApiError} from '@libs/telemetry/trackExpenseCreationError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdatesFromServer, OnyxUpdateEvent, OnyxUpdatesFromServer, Request} from '@src/types/onyx';
import type Response from '@src/types/onyx/Response';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import type {Merge} from 'type-fest';

import Onyx from 'react-native-onyx';

import {getCurrentFlushPromise, queueOnyxUpdates} from './QueuedOnyxUpdates';

// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
let lastUpdateIDAppliedToClient: number | undefined = 0;

// Highest update ID staged for the deferred WRITE flush but not yet persisted. Gap detection treats these as
// applied so queued WRITE responses don't look like gaps; reset if the flush fails so recovery can kick in.
let lastUpdateIDPendingFlush = 0;

function getEffectiveLastUpdateID(): number {
    return Math.max(lastUpdateIDAppliedToClient ?? 0, lastUpdateIDPendingFlush);
}

function getPersistedLastUpdateID(): number {
    return lastUpdateIDAppliedToClient ?? 0;
}

// We have used `connectWithoutView` here because OnyxUpdates is not connected to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => {
        lastUpdateIDAppliedToClient = val;

        // The persisted watermark is only ever cleared by Onyx.clear (sign-out), so drop the pending marker
        // too — a stale value from the previous session would mask real gaps after signing back in.
        if (val === undefined) {
            lastUpdateIDPendingFlush = 0;
        }
    },
});

// This promise is used to ensure pusher events are always processed in the order they are received,
// even when such events are received over multiple separate pusher updates.
let pusherEventsPromise = Promise.resolve();

let airshipEventsPromise = Promise.resolve();

function applyHTTPSOnyxUpdates<TKey extends OnyxKey>(request: Request<TKey>, response: Response<TKey>, lastUpdateID: number) {
    Log.info('[OnyxUpdateManager] Applying https update', false, {lastUpdateID});
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    const updateHandler: (updates: Array<OnyxUpdate<TKey>>) => Promise<unknown> = request?.data?.apiRequestType === CONST.API_REQUEST_TYPE.WRITE ? queueOnyxUpdates : Onyx.update;

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
                // 460 jsonCode in Expensify world means "admin required".
                // Typically, this would only happen if a user attempts an API command that requires policy admin access when they aren't an admin.
                // In this case, we don't want to apply failureData because it will likely result in a RedBrickRoad error on a policy field which is not accessible.
                // Meaning that there's a red dot you can't dismiss.
                if (response.jsonCode === CONST.JSON_CODE.ADMIN_REQUIRED) {
                    Log.info('[OnyxUpdateManager] Received 460 status code, not applying failure data');
                    return Promise.resolve();
                }

                trackExpenseApiError({
                    command: request.command,
                    jsonCode: response.jsonCode ?? 0,
                    message: response.message,
                    requestData: request.data,
                });

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
            Log.info('[OnyxUpdateManager] Done applying HTTPS update', false, {lastUpdateID});
            return Promise.resolve(response);
        });
}

function applyPusherOnyxUpdates<TKey extends OnyxKey>(updates: Array<OnyxUpdateEvent<TKey>>, lastUpdateID: number) {
    pusherEventsPromise = pusherEventsPromise.then(() => {
        Log.info('[OnyxUpdateManager] Applying pusher update', false, {lastUpdateID});
    });

    pusherEventsPromise = updates
        .reduce((promise, update) => promise.then(() => PusherUtils.triggerMultiEventHandler(update.eventType, update.data)), pusherEventsPromise)
        .then(() => {
            Log.info('[OnyxUpdateManager] Done applying Pusher update', false, {lastUpdateID});
        });

    return pusherEventsPromise;
}

function applyAirshipOnyxUpdates<TKey extends OnyxKey>(updates: Array<OnyxUpdateEvent<TKey>>, lastUpdateID: number) {
    airshipEventsPromise = airshipEventsPromise.then(() => {
        Log.info('[OnyxUpdateManager] Applying Airship updates', false, {lastUpdateID});
    });

    airshipEventsPromise = updates
        .reduce((promise, update) => promise.then(() => Onyx.update(update.data as Array<OnyxUpdate<TKey>>)), airshipEventsPromise)
        .then(() => {
            Log.info('[OnyxUpdateManager] Done applying Airship updates', false, {lastUpdateID});
        });

    return airshipEventsPromise;
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function apply<TKey extends OnyxKey>({
    lastUpdateID,
    type,
    request,
    response,
    updates,
}: Merge<OnyxUpdatesFromServer<TKey>, {updates: Array<OnyxUpdateEvent<TKey>>; type: 'pusher'}>): Promise<void>;
function apply<TKey extends OnyxKey>({
    lastUpdateID,
    type,
    request,
    response,
    updates,
}: Merge<OnyxUpdatesFromServer<TKey>, {request: Request<TKey>; response: Response<TKey>; type: 'https'}>): Promise<Response<TKey>>;
function apply<TKey extends OnyxKey>({lastUpdateID, type, request, response, updates}: OnyxUpdatesFromServer<TKey>): Promise<Response<TKey>>;
function apply<TKey extends OnyxKey>({lastUpdateID, type, request, response, updates}: OnyxUpdatesFromServer<TKey>): Promise<void | Response<TKey>> | undefined {
    Log.info(`[OnyxUpdateManager] Applying update type: ${type} with lastUpdateID: ${lastUpdateID}`, false, {command: request?.command});

    const isCatchUpRequest =
        request?.command === SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES || (request?.command === SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP && !!request?.data?.updateIDFrom);
    const effectiveLastUpdateID = isCatchUpRequest ? (lastUpdateIDAppliedToClient ?? 0) : getEffectiveLastUpdateID();
    const isUpdateOld = lastUpdateID && effectiveLastUpdateID && Number(lastUpdateID) <= effectiveLastUpdateID;
    const isOpenAppRequest = request?.command === WRITE_COMMANDS.OPEN_APP;
    const isFullReconnectRequest = request?.command === SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP && !request?.data?.updateIDFrom;

    if (isUpdateOld && !isOpenAppRequest && !isFullReconnectRequest) {
        Log.info('[OnyxUpdateManager] Update received was older than or the same as current state, returning without applying the updates other than successData and failureData', false, {
            lastUpdateID,
            lastUpdateIDAppliedToClient,
            effectiveLastUpdateID,
            command: request?.command,
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

        return Promise.resolve(response);
    }
    const previousLastUpdateIDAppliedToClient = lastUpdateIDAppliedToClient;
    const shouldAdvanceLastUpdateID = !!lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient);

    // Advance the watermark only after the updates are successfully applied. If we advanced first and applying
    // then failed (e.g. a storage write error), the updates would be silently lost and the client would go stale.
    // Keeping the watermark where it is lets the next reconnect refetch and reapply the missed updates.
    const advanceLastUpdateIDAfterApply = <T>(promise: Promise<T>): Promise<T> =>
        promise
            .then((result) => {
                // Deferred updates apply concurrently (Promise.all) and can settle out of order, so re-check the
                // live watermark and only ever move it forward. Otherwise a slower, older update could overwrite a
                // newer one, moving the watermark backwards and making gap detection refetch already-applied updates.
                // The in-memory value is updated synchronously so concurrent settles in the same batch stay monotonic.
                if (shouldAdvanceLastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
                    lastUpdateIDAppliedToClient = Number(lastUpdateID);
                    Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
                }
                // The persisted watermark now covers the staged WRITE updates, so the pending marker is no longer needed
                if (lastUpdateIDPendingFlush && lastUpdateIDPendingFlush <= Number(lastUpdateID)) {
                    lastUpdateIDPendingFlush = 0;
                }
                return result;
            })
            .catch((error) => {
                if (shouldAdvanceLastUpdateID) {
                    Log.alert('[OnyxUpdateManagerError] Applying the updates failed, not advancing lastUpdateID so the client can recover on the next reconnect', {
                        type,
                        command: request?.command,
                        lastUpdateID,
                        previousLastUpdateIDAppliedToClient,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
                throw error;
            });

    if (type === CONST.ONYX_UPDATE_TYPES.HTTPS && request && response) {
        const applyPromise = applyHTTPSOnyxUpdates(request, response, Number(lastUpdateID));

        // WRITE requests only stage their updates in memory here — the real Onyx write happens later in
        // QueuedOnyxUpdates.flushQueue(). Gate the watermark on that flush, but detached from the returned promise:
        // SequentialQueue only flushes after this promise settles, so awaiting the flush here would deadlock.
        if (request.data?.apiRequestType === CONST.API_REQUEST_TYPE.WRITE) {
            if (shouldAdvanceLastUpdateID) {
                lastUpdateIDPendingFlush = Math.max(lastUpdateIDPendingFlush, Number(lastUpdateID));
            }
            advanceLastUpdateIDAfterApply(applyPromise.then(() => getCurrentFlushPromise())).catch(() => {
                // The staged updates never applied, so stop counting them as pending — the next gap check
                // then sees the missing range against the persisted watermark and triggers recovery.
                lastUpdateIDPendingFlush = 0;
            });
            return applyPromise;
        }
        return advanceLastUpdateIDAfterApply(applyPromise);
    }
    if (type === CONST.ONYX_UPDATE_TYPES.PUSHER && updates) {
        return advanceLastUpdateIDAfterApply(applyPusherOnyxUpdates(updates, Number(lastUpdateID)));
    }
    if (type === CONST.ONYX_UPDATE_TYPES.AIRSHIP && updates) {
        return advanceLastUpdateIDAfterApply(applyAirshipOnyxUpdates(updates, Number(lastUpdateID)));
    }
}

/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function saveUpdateInformation<TKey extends OnyxKey>(updateParams: OnyxUpdatesFromServer<TKey>) {
    let modifiedUpdateParams = updateParams;
    // We don't want to store the data in the updateParams if it's a HTTPS update since it is useless anyways
    // and it causes serialization issues when storing in Onyx
    if (updateParams.type === CONST.ONYX_UPDATE_TYPES.HTTPS && updateParams.request) {
        modifiedUpdateParams = {...modifiedUpdateParams, request: {...updateParams.request, data: {apiRequestType: updateParams.request?.data?.apiRequestType}}};
    }
    // Always use set() here so that the updateParams are never merged and always unique to the request that came in

    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, modifiedUpdateParams as AnyOnyxUpdatesFromServer);
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

    // Updates staged for the deferred WRITE flush count as applied here, otherwise the responses of queued
    // WRITE requests would look like gaps until the flush runs and needlessly pause the queue to refetch.
    const lastUpdateIDFromClient = Math.max(clientLastUpdateID ?? lastUpdateIDAppliedToClient ?? 0, lastUpdateIDPendingFlush);

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

export {apply, doesClientNeedToBeUpdated, getEffectiveLastUpdateID, getPersistedLastUpdateID, saveUpdateInformation, applyHTTPSOnyxUpdates as INTERNAL_DO_NOT_USE_applyHTTPSOnyxUpdates};
export type {DoesClientNeedToBeUpdatedParams as ManualOnyxUpdateCheckIds};
