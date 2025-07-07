"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyUpdates = void 0;
exports.detectGapsAndSplit = detectGapsAndSplit;
exports.validateAndApplyDeferredUpdates = validateAndApplyDeferredUpdates;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var App = require("@userActions/App");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var applyUpdates_1 = require("./applyUpdates");
Object.defineProperty(exports, "applyUpdates", { enumerable: true, get: function () { return applyUpdates_1.applyUpdates; } });
// eslint-disable-next-line import/no-cycle
var DeferredOnyxUpdates = require("./DeferredOnyxUpdates");
var lastUpdateIDAppliedToClient = CONST_1.default.DEFAULT_NUMBER_ID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: function (value) { return (lastUpdateIDAppliedToClient = value !== null && value !== void 0 ? value : CONST_1.default.DEFAULT_NUMBER_ID); },
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
function detectGapsAndSplit(lastUpdateIDFromClient) {
    var _a;
    // We only want to apply deferred updates that are newer than the last update that was applied to the client.
    // At this point, the missing updates from "GetMissingOnyxUpdates" have been applied already,
    // so we can safely filter out any outdated deferred updates.
    var pendingDeferredUpdates = DeferredOnyxUpdates.getUpdates({ minUpdateID: lastUpdateIDFromClient });
    // If there are no remaining deferred updates after filtering out outdated updates,
    // we don't need to iterate over the deferred updates and check for gaps.
    if (Object.values(pendingDeferredUpdates).length === 0) {
        return { applicableUpdates: {}, updatesAfterGaps: {}, latestMissingUpdateID: undefined };
    }
    var updateValues = Object.values(pendingDeferredUpdates);
    var applicableUpdates = {};
    var gapExists = false;
    var firstUpdateIDAfterGaps;
    var latestMissingUpdateID;
    for (var _i = 0, _b = updateValues.entries(); _i < _b.length; _i++) {
        var _c = _b[_i], index = _c[0], update = _c[1];
        var isFirst = index === 0;
        var lastUpdateID = Number(update.lastUpdateID);
        var previousUpdateID = Number(update.previousUpdateID);
        // Whether the previous update (of the current update) is outdated, because there was a newer update applied to the client.
        var isPreviousUpdateAlreadyApplied = previousUpdateID <= lastUpdateIDFromClient;
        // If any update's previousUpdateID doesn't match the lastUpdateID of the previous update,
        // the deferred updates aren't chained and we detected a gap.
        // For the first update, we need to check that the previousUpdateID of the current update is the same as the lastUpdateIDAppliedToClient.
        // For any other updates, we need to check if the previousUpdateID of the current update is found in the deferred updates.
        // If an update is chained, we can add it to the applicable updates.
        var isChainedToPreviousUpdate = isFirst ? isPreviousUpdateAlreadyApplied : !!pendingDeferredUpdates[previousUpdateID];
        if (isChainedToPreviousUpdate) {
            // If we found a gap in the deferred updates, we will not add any more updates to the applicable updates.
            // Instead, if we find two chained updates, we can set "firstUpdateIDAfterGaps" to the first update after the gap.
            if (gapExists) {
                // If there was a gap, "firstUpdateIDAfterGaps" isn't set and we find two chained updates,
                // we need to set "firstUpdateIDAfterGaps" to the first update after the gap.
                if (!firstUpdateIDAfterGaps) {
                    firstUpdateIDAfterGaps = previousUpdateID;
                }
            }
            else {
                // If no gap exists yet, we can add the update to the applicable updates
                applicableUpdates[lastUpdateID] = update;
            }
        }
        else {
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
    var updatesAfterGaps = {};
    if (gapExists) {
        // If there is a gap and we didn't detect two chained updates, "firstUpdateToBeAppliedAfterGap" will always be the the last deferred update.
        // We will fetch all missing updates up to the previous update and can always apply the last deferred update.
        var firstUpdateToBeAppliedAfterGap_1 = firstUpdateIDAfterGaps !== null && firstUpdateIDAfterGaps !== void 0 ? firstUpdateIDAfterGaps : Number((_a = updateValues.at(-1)) === null || _a === void 0 ? void 0 : _a.lastUpdateID);
        // Add all deferred updates after the gap(s) to "updatesAfterGaps".
        // If "firstUpdateToBeAppliedAfterGap" is set to the last deferred update, the array will be empty.
        Object.entries(pendingDeferredUpdates).forEach(function (_a) {
            var lastUpdateID = _a[0], update = _a[1];
            if (Number(lastUpdateID) < firstUpdateToBeAppliedAfterGap_1) {
                return;
            }
            updatesAfterGaps[Number(lastUpdateID)] = update;
        }, {});
    }
    return { applicableUpdates: applicableUpdates, updatesAfterGaps: updatesAfterGaps, latestMissingUpdateID: latestMissingUpdateID };
}
/**
 * This function will check for gaps in the deferred updates and
 * apply the updates in order after the missing updates are fetched and applied
 */
function validateAndApplyDeferredUpdates(clientLastUpdateID, previousParams) {
    var _a;
    var lastUpdateIDFromClient = (_a = clientLastUpdateID !== null && clientLastUpdateID !== void 0 ? clientLastUpdateID : lastUpdateIDAppliedToClient) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    Log_1.default.info('[DeferredUpdates] Processing deferred updates', false, { lastUpdateIDFromClient: lastUpdateIDFromClient, previousParams: previousParams });
    var _b = detectGapsAndSplit(lastUpdateIDFromClient), applicableUpdates = _b.applicableUpdates, updatesAfterGaps = _b.updatesAfterGaps, latestMissingUpdateID = _b.latestMissingUpdateID;
    // If there are no applicably deferred updates and no missing deferred updates,
    // we don't need to apply or re-fetch any updates. We can just unpause the queue by resolving.
    if (Object.values(applicableUpdates).length === 0 && latestMissingUpdateID === undefined) {
        return Promise.resolve();
    }
    // If newer updates got applied, we don't need to refetch for missing updates
    // and will re-trigger the "validateAndApplyDeferredUpdates" process
    if (latestMissingUpdateID) {
        Log_1.default.info('[DeferredUpdates] Gap detected in deferred updates', false, { lastUpdateIDFromClient: lastUpdateIDFromClient, latestMissingUpdateID: latestMissingUpdateID });
        return new Promise(function (resolve, reject) {
            DeferredOnyxUpdates.clear({ shouldUnpauseSequentialQueue: false, shouldResetGetMissingOnyxUpdatesPromise: false });
            (0, applyUpdates_1.applyUpdates)(applicableUpdates).then(function () {
                // After we have applied the applicable updates, there might have been new deferred updates added.
                // In the next (recursive) call of "validateAndApplyDeferredUpdates",
                // the initial "updatesAfterGaps" and all new deferred updates will be applied in order,
                // as long as there was no new gap detected. Otherwise, repeat the process.
                var _a;
                var newLastUpdateIDFromClient = (_a = clientLastUpdateID !== null && clientLastUpdateID !== void 0 ? clientLastUpdateID : lastUpdateIDAppliedToClient) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
                DeferredOnyxUpdates.enqueue(updatesAfterGaps, { shouldPauseSequentialQueue: false });
                // If lastUpdateIDAppliedToClient got updated, we will just re-trigger the validation
                // and application of the current deferred updates.
                if (latestMissingUpdateID <= newLastUpdateIDFromClient) {
                    validateAndApplyDeferredUpdates(undefined, { newLastUpdateIDFromClient: newLastUpdateIDFromClient, latestMissingUpdateID: latestMissingUpdateID })
                        .then(function () { return resolve(undefined); })
                        .catch(reject);
                    return;
                }
                // Prevent info loops of calls to GetMissingOnyxMessages
                if ((previousParams === null || previousParams === void 0 ? void 0 : previousParams.newLastUpdateIDFromClient) === newLastUpdateIDFromClient && (previousParams === null || previousParams === void 0 ? void 0 : previousParams.latestMissingUpdateID) === latestMissingUpdateID) {
                    Log_1.default.info('[DeferredUpdates] Aborting call to GetMissingOnyxMessages, repeated params', false, { lastUpdateIDFromClient: lastUpdateIDFromClient, latestMissingUpdateID: latestMissingUpdateID, previousParams: previousParams });
                    resolve(undefined);
                    return;
                }
                // Then we can fetch the missing updates and apply them
                App.getMissingOnyxUpdates(newLastUpdateIDFromClient, latestMissingUpdateID)
                    .then(function () { return validateAndApplyDeferredUpdates(undefined, { newLastUpdateIDFromClient: newLastUpdateIDFromClient, latestMissingUpdateID: latestMissingUpdateID }); })
                    .then(function () { return resolve(undefined); })
                    .catch(reject);
            });
        });
    }
    // If there are no gaps in the deferred updates, we can apply all deferred updates in order
    return (0, applyUpdates_1.applyUpdates)(applicableUpdates).then(function () { return undefined; });
}
