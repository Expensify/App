import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
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
// It's important that this file is separate and not imported by OnyxUpdates.js, so that there are no circular dependencies.
// Onyx is used as a pub/sub mechanism to break out of the circular dependency.
// The circular dependency happens because this file calls API.GetMissingOnyxUpdates() which uses the SaveResponseInOnyx.js file (as a middleware).
// Therefore, SaveResponseInOnyx.js can't import and use this file directly.

let lastUpdateIDAppliedToClient = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => (lastUpdateIDAppliedToClient = value ?? 0),
});

let isLoadingApp = false;
Onyx.connect({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = value ?? false;
    },
});

let queryPromise: Promise<Response | Response[] | void> | undefined;

type DeferredUpdatesDictionary = Record<number, OnyxUpdatesFromServer>;
let deferredUpdates: DeferredUpdatesDictionary = {};

// This function will reset the query variables, unpause the SequentialQueue and log an info to the user.
function finalizeUpdatesAndResumeQueue() {
    console.debug('[OnyxUpdateManager] Done applying all updates');
    queryPromise = undefined;
    deferredUpdates = {};
    Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
    SequentialQueue.unpause();
}

// This function applies a list of updates to Onyx in order and resolves when all updates have been applied
const applyUpdates = (updates: DeferredUpdatesDictionary) => Promise.all(Object.values(updates).map((update) => OnyxUpdates.apply(update)));

// In order for the deferred updates to be applied correctly in order,
// we need to check if there are any gaps between deferred updates.
type DetectGapAndSplitResult = {applicableUpdates: DeferredUpdatesDictionary; updatesAfterGaps: DeferredUpdatesDictionary; latestMissingUpdateID: number | undefined};
function detectGapsAndSplit(updates: DeferredUpdatesDictionary): DetectGapAndSplitResult {
    const updateValues = Object.values(updates);
    const applicableUpdates: DeferredUpdatesDictionary = {};

    let gapExists = false;
    let firstUpdateAfterGaps: number | undefined;
    let latestMissingUpdateID: number | undefined;

    for (const [index, update] of updateValues.entries()) {
        const isFirst = index === 0;

        // If any update's previousUpdateID doesn't match the lastUpdateID from the previous update, the deferred updates aren't chained and there's a gap.
        // For the first update, we need to check that the previousUpdateID of the fetched update is the same as the lastUpdateIDAppliedToClient.
        // For any other updates, we need to check if the previousUpdateID of the current update is found in the deferred updates.
        // If an update is chained, we can add it to the applicable updates.
        const isChained = isFirst ? update.previousUpdateID === lastUpdateIDAppliedToClient : !!updates[Number(update.previousUpdateID)];
        if (isChained) {
            // If a gap exists already, we will not add any more updates to the applicable updates.
            // Instead, once there are two chained updates again, we can set "firstUpdateAfterGaps" to the first update after the current gap.
            if (gapExists) {
                // If "firstUpdateAfterGaps" hasn't been set yet and there was a gap, we need to set it to the first update after all gaps.
                if (!firstUpdateAfterGaps) {
                    firstUpdateAfterGaps = Number(update.previousUpdateID);
                }
            } else {
                // If no gap exists yet, we can add the update to the applicable updates
                applicableUpdates[Number(update.lastUpdateID)] = update;
            }
        } else {
            // When we find a (new) gap, we need to set "gapExists" to true and reset the "firstUpdateAfterGaps" variable,
            // so that we can continue searching for the next update after all gaps
            gapExists = true;
            firstUpdateAfterGaps = undefined;

            // If there is a gap, it means the previous update is the latest missing update.
            latestMissingUpdateID = Number(update.previousUpdateID);
        }
    }

    // When "firstUpdateAfterGaps" is not set yet, we need to set it to the last update in the list,
    // because we will fetch all missing updates up to the previous one and can then always apply the last update in the deferred updates.
    if (!firstUpdateAfterGaps) {
        firstUpdateAfterGaps = Number(updateValues[updateValues.length - 1].lastUpdateID);
    }

    let updatesAfterGaps: DeferredUpdatesDictionary = {};
    if (gapExists) {
        updatesAfterGaps = Object.entries(updates).reduce<DeferredUpdatesDictionary>(
            (accUpdates, [lastUpdateID, update]) => ({
                ...accUpdates,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...(Number(lastUpdateID) >= firstUpdateAfterGaps ? {[Number(lastUpdateID)]: update} : {}),
            }),
            {},
        );
    }

    return {applicableUpdates, updatesAfterGaps, latestMissingUpdateID};
}

// This function will check for gaps in the deferred updates and
// apply the updates in order after the missing updates are fetched and applied
function validateAndApplyDeferredUpdates(): Promise<Response[] | void> {
    // We only want to apply deferred updates that are newer than the last update that was applied to the client.
    // At this point, the missing updates from "GetMissingOnyxUpdates" have been applied already, so we can safely filter out.
    const pendingDeferredUpdates = Object.entries(deferredUpdates).reduce<DeferredUpdatesDictionary>(
        (accUpdates, [lastUpdateID, update]) => ({
            ...accUpdates,
            ...(Number(lastUpdateID) > lastUpdateIDAppliedToClient ? {[Number(lastUpdateID)]: update} : {}),
        }),
        {},
    );

    // If there are no remaining deferred updates after filtering out outdated ones,
    // we can just unpause the queue and return
    if (Object.values(pendingDeferredUpdates).length === 0) {
        return Promise.resolve();
    }

    const {applicableUpdates, updatesAfterGaps, latestMissingUpdateID} = detectGapsAndSplit(pendingDeferredUpdates);

    // If we detected a gap in the deferred updates, only apply the deferred updates before the gap,
    // re-fetch the missing updates and then apply the remaining deferred updates after the gap
    if (latestMissingUpdateID) {
        return new Promise((resolve, reject) => {
            deferredUpdates = {};

            applyUpdates(applicableUpdates).then(() => {
                // After we have applied the applicable updates, there might have been new deferred updates added.
                // In the next (recursive) call of "validateAndApplyDeferredUpdates",
                // the initial "updatesAfterGaps" and all new deferred updates will be applied in order,
                // as long as there was no new gap detected. Otherwise repeat the process.
                deferredUpdates = {...deferredUpdates, ...updatesAfterGaps};

                // It should not be possible for lastUpdateIDAppliedToClient to be null, therefore we can ignore this case.
                // If lastUpdateIDAppliedToClient got updated in the meantime, we will just retrigger the validation and application of the current deferred updates.
                if (latestMissingUpdateID <= lastUpdateIDAppliedToClient) {
                    validateAndApplyDeferredUpdates().then(resolve).catch(reject);
                    return;
                }

                // Then we can fetch the missing updates and apply them
                App.getMissingOnyxUpdates(lastUpdateIDAppliedToClient, latestMissingUpdateID).then(validateAndApplyDeferredUpdates).then(resolve).catch(reject);
            });
        });
    }

    // If there are no gaps in the deferred updates, we can apply all deferred updates in order
    return applyUpdates(applicableUpdates);
}

/**
 *
 * @param onyxUpdatesFromServer
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 * @returns
 */
function handleOnyxUpdateGap(onyxUpdatesFromServer: OnyxEntry<OnyxUpdatesFromServer>, clientLastUpdateID?: number) {
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

    // When there is no value or an invalid value, there's nothing to process, so let's return early.
    if (!isValidOnyxUpdateFromServer(onyxUpdatesFromServer)) {
        return;
    }

    const updateParams = onyxUpdatesFromServer;
    const lastUpdateIDFromServer = onyxUpdatesFromServer.lastUpdateID;
    const previousUpdateIDFromServer = onyxUpdatesFromServer.previousUpdateID;
    const lastUpdateIDFromClient = clientLastUpdateID ?? lastUpdateIDAppliedToClient ?? 0;

    // In cases where we received a previousUpdateID and it doesn't match our lastUpdateIDAppliedToClient
    // we need to perform one of the 2 possible cases:
    //
    // 1. This is the first time we're receiving an lastUpdateID, so we need to do a final reconnectApp before
    // fully migrating to the reliable updates mode.
    // 2. This client already has the reliable updates mode enabled, but it's missing some updates and it
    // needs to fetch those.

    // The flow below is setting the promise to a reconnect app to address flow (1) explained above.
    if (!lastUpdateIDFromClient) {
        // If there is a ReconnectApp query in progress, we should not start another one.
        if (queryPromise) {
            return;
        }

        Log.info('Client has not gotten reliable updates before so reconnecting the app to start the process');

        // Since this is a full reconnectApp, we'll not apply the updates we received - those will come in the reconnect app request.
        queryPromise = App.finalReconnectAppAfterActivatingReliableUpdates();
    } else {
        // The flow below is setting the promise to a getMissingOnyxUpdates to address flow (2) explained above.

        // Get the number of deferred updates before adding the new one
        const existingDeferredUpdatesCount = Object.keys(deferredUpdates).length;

        // Add the new update to the deferred updates
        deferredUpdates[Number(updateParams.lastUpdateID)] = updateParams;

        // If there are deferred updates already, we don't need to fetch the missing updates again.
        if (existingDeferredUpdatesCount > 0) {
            return;
        }

        console.debug(`[OnyxUpdateManager] Client is behind the server by ${Number(previousUpdateIDFromServer) - lastUpdateIDFromClient} so fetching incremental updates`);
        Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
            lastUpdateIDFromServer,
            previousUpdateIDFromServer,
            lastUpdateIDFromClient,
        });

        // Get the missing Onyx updates from the server and afterwards validate and apply the deferred updates.
        // This will trigger recursive calls to "validateAndApplyDeferredUpdates" if there are gaps in the deferred updates.
        queryPromise = App.getMissingOnyxUpdates(lastUpdateIDFromClient, previousUpdateIDFromServer).then(validateAndApplyDeferredUpdates);
    }

    queryPromise.finally(finalizeUpdatesAndResumeQueue);
}

export default () => {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    Onyx.connect({
        key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
        callback: (value) => handleOnyxUpdateGap(value),
    });
};

export {handleOnyxUpdateGap};
