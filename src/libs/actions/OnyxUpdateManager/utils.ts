import * as App from '@userActions/App';
import * as OnyxUpdates from '@userActions/OnyxUpdates';
import type DeferredUpdatesDictionary from './types';

// This function applies a list of updates to Onyx in order and resolves when all updates have been applied
const applyUpdates = (updates: DeferredUpdatesDictionary) => Promise.all(Object.values(updates).map((update) => OnyxUpdates.apply(update)));

// In order for the deferred updates to be applied correctly in order,
// we need to check if there are any gaps between deferred updates.
type DetectGapAndSplitResult = {applicableUpdates: DeferredUpdatesDictionary; updatesAfterGaps: DeferredUpdatesDictionary; latestMissingUpdateID: number | undefined};
function detectGapsAndSplit(updates: DeferredUpdatesDictionary, lastUpdateIDFromClient: number): DetectGapAndSplitResult {
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
        const isChained = isFirst ? update.previousUpdateID === lastUpdateIDFromClient : !!updates[Number(update.previousUpdateID)];
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
function validateAndApplyDeferredUpdates(deferredUpdates: DeferredUpdatesDictionary, lastUpdateIDFromClient: number): Promise<DeferredUpdatesDictionary> {
    let newDeferredUpdates = {...deferredUpdates};

    // We only want to apply deferred updates that are newer than the last update that was applied to the client.
    // At this point, the missing updates from "GetMissingOnyxUpdates" have been applied already, so we can safely filter out.
    const pendingDeferredUpdates = Object.entries(newDeferredUpdates).reduce<DeferredUpdatesDictionary>(
        (accUpdates, [lastUpdateID, update]) => ({
            ...accUpdates,
            ...(Number(lastUpdateID) > lastUpdateIDFromClient ? {[Number(lastUpdateID)]: update} : {}),
        }),
        {},
    );

    // If there are no remaining deferred updates after filtering out outdated ones,
    // we can just unpause the queue and return
    if (Object.values(pendingDeferredUpdates).length === 0) {
        return Promise.resolve(newDeferredUpdates);
    }

    const {applicableUpdates, updatesAfterGaps, latestMissingUpdateID} = detectGapsAndSplit(pendingDeferredUpdates, lastUpdateIDFromClient);

    // If we detected a gap in the deferred updates, only apply the deferred updates before the gap,
    // re-fetch the missing updates and then apply the remaining deferred updates after the gap
    if (latestMissingUpdateID) {
        return new Promise((resolve, reject) => {
            newDeferredUpdates = {};

            applyUpdates(applicableUpdates).then(() => {
                // After we have applied the applicable updates, there might have been new deferred updates added.
                // In the next (recursive) call of "validateAndApplyDeferredUpdates",
                // the initial "updatesAfterGaps" and all new deferred updates will be applied in order,
                // as long as there was no new gap detected. Otherwise repeat the process.
                newDeferredUpdates = {...newDeferredUpdates, ...updatesAfterGaps};

                // It should not be possible for lastUpdateIDAppliedToClient to be null, therefore we can ignore this case.
                // If lastUpdateIDAppliedToClient got updated in the meantime, we will just retrigger the validation and application of the current deferred updates.
                if (latestMissingUpdateID <= lastUpdateIDFromClient) {
                    validateAndApplyDeferredUpdates(newDeferredUpdates, lastUpdateIDFromClient)
                        .then(() => resolve(newDeferredUpdates))
                        .catch(reject);
                    return;
                }

                // Then we can fetch the missing updates and apply them
                App.getMissingOnyxUpdates(lastUpdateIDFromClient, latestMissingUpdateID)
                    .then(() => validateAndApplyDeferredUpdates(newDeferredUpdates, lastUpdateIDFromClient))
                    .then(() => resolve(newDeferredUpdates))
                    .catch(reject);
            });
        });
    }

    // If there are no gaps in the deferred updates, we can apply all deferred updates in order
    return applyUpdates(applicableUpdates).then(() => newDeferredUpdates);
}

export {applyUpdates, detectGapsAndSplit, validateAndApplyDeferredUpdates};
