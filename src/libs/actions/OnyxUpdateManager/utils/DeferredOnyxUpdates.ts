import Onyx from 'react-native-onyx';
import type {DeferredUpdatesDictionary, DetectGapAndSplitResult} from '@libs/actions/OnyxUpdateManager/types';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, Response} from '@src/types/onyx';
import {isValidOnyxUpdateFromServer} from '@src/types/onyx/OnyxUpdatesFromServer';
import {applyUpdates} from './applyUpdates';

let missingOnyxUpdatesQueryPromise: Promise<Response | Response[] | void> | undefined;
let deferredUpdates: DeferredUpdatesDictionary = {};
let lastUpdateIDAppliedToClient = 0;

Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => (lastUpdateIDAppliedToClient = value ?? 0),
});

/**
 * In order for the deferred updates to be applied correctly in order,
 * we need to check if there are any gaps between deferred updates.
 * If there are gaps, we need to split the deferred updates into two parts:
 * 1. The applicable updates that can be applied immediately
 * 2. The updates after the gaps that need to be fetched and applied first
 * @param updates The deferred updates to be checked for gaps
 * @param lastUpdateIDFromClient An optional lastUpdateID passed to use instead of the lastUpdateIDAppliedToClient
 * @returns
 */
function detectGapsAndSplit(lastUpdateIDFromClient: number): DetectGapAndSplitResult {
    // We only want to apply deferred updates that are newer than the last update that was applied to the client.
    // At this point, the missing updates from "GetMissingOnyxUpdates" have been applied already,
    // so we can safely filter out any outdated deferred updates.
    const pendingDeferredUpdates = getUpdates({minUpdateID: lastUpdateIDFromClient});

    // If there are no remaining deferred updates after filtering out outdated updates,
    // we don't need to iterate over the deferred updates and check for gaps.
    if (Object.values(pendingDeferredUpdates).length === 0) {
        return {applicableUpdates: {}, updatesAfterGaps: {}, latestMissingUpdateID: undefined};
    }

    const updateValues = Object.values(pendingDeferredUpdates);
    const applicableUpdates: DeferredUpdatesDictionary = {};

    let gapExists = false;
    let firstUpdateIDAfterGaps: number | undefined;
    let latestMissingUpdateID: number | undefined;

    for (const [index, update] of updateValues.entries()) {
        const isFirst = index === 0;

        const lastUpdateID = Number(update.lastUpdateID);
        const previousUpdateID = Number(update.previousUpdateID);

        // Whether the previous update (of the current update) is outdated, because there was a newer update applied to the client.
        const isPreviousUpdateAlreadyApplied = previousUpdateID <= lastUpdateIDFromClient;

        // If any update's previousUpdateID doesn't match the lastUpdateID of the previous update,
        // the deferred updates aren't chained and we detected a gap.
        // For the first update, we need to check that the previousUpdateID of the current update is the same as the lastUpdateIDAppliedToClient.
        // For any other updates, we need to check if the previousUpdateID of the current update is found in the deferred updates.
        // If an update is chained, we can add it to the applicable updates.
        const isChainedToPreviousUpdate = isFirst ? isPreviousUpdateAlreadyApplied : !!pendingDeferredUpdates[previousUpdateID];
        if (isChainedToPreviousUpdate) {
            // If we found a gap in the deferred updates, we will not add any more updates to the applicable updates.
            // Instead, if we find two chained updates, we can set "firstUpdateIDAfterGaps" to the first update after the gap.
            if (gapExists) {
                // If there was a gap, "firstUpdateIDAfterGaps" isn't set and we find two chained updates,
                // we need to set "firstUpdateIDAfterGaps" to the first update after the gap.
                if (!firstUpdateIDAfterGaps) {
                    firstUpdateIDAfterGaps = previousUpdateID;
                }
            } else {
                // If no gap exists yet, we can add the update to the applicable updates
                applicableUpdates[lastUpdateID] = update;
            }
        } else {
            // If a previous update has already been applied to the client we should not detect a gap.
            // This can cause a recursion loop, because "validateAndApplyDeferredUpdates" will refetch
            // missing updates up to the previous update, which will then be applied again.
            if (isPreviousUpdateAlreadyApplied) {
                // eslint-disable-next-line no-continue
                continue;
            }

            // When we find a (new) gap, we initially need to set "gapExists" to true
            // and reset "firstUpdateIDAfterGaps" and continue searching the first update after all gaps.
            gapExists = true;
            firstUpdateIDAfterGaps = undefined;

            // We need to set update the latest missing update to the previous update of the current unchained update.
            latestMissingUpdateID = previousUpdateID;
        }
    }

    const updatesAfterGaps: DeferredUpdatesDictionary = {};
    if (gapExists) {
        // If there is a gap and we didn't detect two chained updates, "firstUpdateToBeAppliedAfterGap" will always be the the last deferred update.
        // We will fetch all missing updates up to the previous update and can always apply the last deferred update.
        const firstUpdateToBeAppliedAfterGap = firstUpdateIDAfterGaps ?? Number(updateValues.at(-1)?.lastUpdateID);

        // Add all deferred updates after the gap(s) to "updatesAfterGaps".
        // If "firstUpdateToBeAppliedAfterGap" is set to the last deferred update, the array will be empty.
        Object.entries(pendingDeferredUpdates).forEach(([lastUpdateID, update]) => {
            if (Number(lastUpdateID) < firstUpdateToBeAppliedAfterGap) {
                return;
            }

            updatesAfterGaps[Number(lastUpdateID)] = update;
        }, {});
    }

    return {applicableUpdates, updatesAfterGaps, latestMissingUpdateID};
}

/**
 * This function will check for gaps in the deferred updates and
 * apply the updates in order after the missing updates are fetched and applied
 */
function validateAndApplyDeferredUpdates(clientLastUpdateID?: number, previousParams?: {newLastUpdateIDFromClient: number; latestMissingUpdateID: number}): Promise<void> {
    const lastUpdateIDFromClient = clientLastUpdateID ?? lastUpdateIDAppliedToClient ?? 0;

    Log.info('[DeferredUpdates] Processing deferred updates', false, {lastUpdateIDFromClient, previousParams});

    const {applicableUpdates, updatesAfterGaps, latestMissingUpdateID} = detectGapsAndSplit(lastUpdateIDFromClient);

    // If there are no applicable deferred updates and no missing deferred updates,
    // we don't need to apply or re-fetch any updates. We can just unpause the queue by resolving.
    if (Object.values(applicableUpdates).length === 0 && latestMissingUpdateID === undefined) {
        return Promise.resolve();
    }

    // If newer updates got applied, we don't need to refetch for missing updates
    // and will re-trigger the "validateAndApplyDeferredUpdates" process
    if (latestMissingUpdateID) {
        Log.info('[DeferredUpdates] Gap detected in deferred updates', false, {lastUpdateIDFromClient, latestMissingUpdateID});

        return new Promise((resolve, reject) => {
            clear({shouldUnpauseSequentialQueue: false, shouldResetGetMissingOnyxUpdatesPromise: false});

            applyUpdates(applicableUpdates).then(() => {
                // After we have applied the applicable updates, there might have been new deferred updates added.
                // In the next (recursive) call of "validateAndApplyDeferredUpdates",
                // the initial "updatesAfterGaps" and all new deferred updates will be applied in order,
                // as long as there was no new gap detected. Otherwise repeat the process.

                const newLastUpdateIDFromClient = clientLastUpdateID ?? lastUpdateIDAppliedToClient ?? 0;

                enqueue(updatesAfterGaps, {shouldPauseSequentialQueue: false});

                // If lastUpdateIDAppliedToClient got updated, we will just retrigger the validation
                // and application of the current deferred updates.
                if (latestMissingUpdateID <= newLastUpdateIDFromClient) {
                    validateAndApplyDeferredUpdates(undefined, {newLastUpdateIDFromClient, latestMissingUpdateID})
                        .then(() => resolve(undefined))
                        .catch(reject);
                    return;
                }

                // Prevent info loops of calls to GetMissingOnyxMessages
                if (previousParams?.newLastUpdateIDFromClient === newLastUpdateIDFromClient && previousParams?.latestMissingUpdateID === latestMissingUpdateID) {
                    Log.info('[DeferredUpdates] Aborting call to GetMissingOnyxMessages, repeated params', false, {lastUpdateIDFromClient, latestMissingUpdateID, previousParams});
                    resolve(undefined);
                    return;
                }

                // Then we can fetch the missing updates and apply them
                App.getMissingOnyxUpdates(newLastUpdateIDFromClient, latestMissingUpdateID)
                    .then(() => validateAndApplyDeferredUpdates(undefined, {newLastUpdateIDFromClient, latestMissingUpdateID}))
                    .then(() => resolve(undefined))
                    .catch(reject);
            });
        });
    }

    // If there are no gaps in the deferred updates, we can apply all deferred updates in order
    return applyUpdates(applicableUpdates).then(() => undefined);
}

/**
 * Returns the promise that fetches the missing onyx updates
 * @returns the promise
 */
function getMissingOnyxUpdatesQueryPromise() {
    return missingOnyxUpdatesQueryPromise;
}

/**
 * Sets the promise that fetches the missing onyx updates
 */
function setMissingOnyxUpdatesQueryPromise(promise: Promise<Response | Response[] | void>) {
    missingOnyxUpdatesQueryPromise = promise;
}

type GetDeferredOnyxUpdatesOptiosn = {
    minUpdateID?: number;
};

/**
 * Returns the deferred updates that are currently in the queue
 * @param minUpdateID An optional minimum update ID to filter the deferred updates by
 * @returns
 */
function getUpdates(options?: GetDeferredOnyxUpdatesOptiosn) {
    if (options?.minUpdateID == null) {
        return deferredUpdates;
    }

    return Object.entries(deferredUpdates).reduce<DeferredUpdatesDictionary>((acc, [lastUpdateID, update]) => {
        if (Number(lastUpdateID) > (options.minUpdateID ?? 0)) {
            acc[Number(lastUpdateID)] = update;
        }
        return acc;
    }, {});
}

/**
 * Returns a boolean indicating whether the deferred updates queue is empty
 * @returns a boolean indicating whether the deferred updates queue is empty
 */
function isEmpty() {
    return Object.keys(deferredUpdates).length === 0;
}

/**
 * Manually processes and applies the updates from the deferred updates queue. (used e.g. for push notifications)
 */
function process() {
    if (missingOnyxUpdatesQueryPromise) {
        missingOnyxUpdatesQueryPromise.finally(() => validateAndApplyDeferredUpdates);
    }

    missingOnyxUpdatesQueryPromise = validateAndApplyDeferredUpdates();
}

type EnqueueDeferredOnyxUpdatesOptions = {
    shouldPauseSequentialQueue?: boolean;
};

/**
 * Allows adding onyx updates to the deferred updates queue manually.
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 * @param options additional flags to change the behaviour of this function
 */
function enqueue(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredOnyxUpdatesOptions) {
    if (options?.shouldPauseSequentialQueue ?? true) {
        SequentialQueue.pause();
    }

    // We check here if the "updates" param is a single update.
    // If so, we only need to insert one update into the deferred updates queue.
    if (isValidOnyxUpdateFromServer(updates)) {
        const lastUpdateID = Number(updates.lastUpdateID);
        deferredUpdates[lastUpdateID] = updates;
    } else {
        // If the "updates" param is an object, we need to insert multiple updates into the deferred updates queue.
        Object.entries(updates).forEach(([lastUpdateIDString, update]) => {
            const lastUpdateID = Number(lastUpdateIDString);
            if (deferredUpdates[lastUpdateID]) {
                return;
            }

            deferredUpdates[lastUpdateID] = update;
        });
    }
}

/**
 * Adds updates to the deferred updates queue and processes them immediately
 * @param updates The updates that should be applied (e.g. updates from push notifications)
 */
function enqueueAndProcess(updates: OnyxUpdatesFromServer | DeferredUpdatesDictionary, options?: EnqueueDeferredOnyxUpdatesOptions) {
    enqueue(updates, options);
    process();
}

type ClearDeferredOnyxUpdatesOptions = {
    shouldResetGetMissingOnyxUpdatesPromise?: boolean;
    shouldUnpauseSequentialQueue?: boolean;
};

/**
 * Clears the deferred updates queue and unpauses the SequentialQueue
 * @param options additional flags to change the behaviour of this function
 */
function clear(options?: ClearDeferredOnyxUpdatesOptions) {
    deferredUpdates = {};

    if (options?.shouldResetGetMissingOnyxUpdatesPromise ?? true) {
        missingOnyxUpdatesQueryPromise = undefined;
    }

    if (options?.shouldUnpauseSequentialQueue ?? true) {
        Onyx.set(ONYXKEYS.ONYX_UPDATES_FROM_SERVER, null);
        SequentialQueue.unpause();
    }
}

export {
    getMissingOnyxUpdatesQueryPromise,
    setMissingOnyxUpdatesQueryPromise,
    getUpdates,
    isEmpty,
    process,
    enqueue,
    enqueueAndProcess,
    clear,
    validateAndApplyDeferredUpdates,
    detectGapsAndSplit,
};
