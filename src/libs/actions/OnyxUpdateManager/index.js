"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDeferralLogicVariables = exports.queryPromise = void 0;
exports.handleMissingOnyxUpdates = handleMissingOnyxUpdates;
var react_native_onyx_1 = require("react-native-onyx");
var ActiveClientManager = require("@libs/ActiveClientManager");
var Log_1 = require("@libs/Log");
var NetworkStore_1 = require("@libs/Network/NetworkStore");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var App_1 = require("@userActions/App");
var updateSessionAuthTokens_1 = require("@userActions/Session/updateSessionAuthTokens");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnyxUpdatesFromServer_1 = require("@src/types/onyx/OnyxUpdatesFromServer");
var utils_1 = require("./utils");
var DeferredOnyxUpdates_1 = require("./utils/DeferredOnyxUpdates");
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
var lastUpdateIDAppliedToClient = CONST_1.default.DEFAULT_NUMBER_ID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: function (value) { return (lastUpdateIDAppliedToClient = value !== null && value !== void 0 ? value : CONST_1.default.DEFAULT_NUMBER_ID); },
});
var isLoadingApp = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_LOADING_APP,
    callback: function (value) {
        isLoadingApp = value !== null && value !== void 0 ? value : false;
    },
});
var resolveQueryPromiseWrapper;
var createQueryPromiseWrapper = function () {
    return new Promise(function (resolve) {
        resolveQueryPromiseWrapper = resolve;
    });
};
// eslint-disable-next-line import/no-mutable-exports
var queryPromiseWrapper = createQueryPromiseWrapper();
exports.queryPromise = queryPromiseWrapper;
var isFetchingForPendingUpdates = false;
var resetDeferralLogicVariables = function () {
    (0, DeferredOnyxUpdates_1.clear)({ shouldUnpauseSequentialQueue: false });
};
exports.resetDeferralLogicVariables = resetDeferralLogicVariables;
// This function will reset the query variables, unpause the SequentialQueue and log an info to the user.
function finalizeUpdatesAndResumeQueue() {
    console.debug('[OnyxUpdateManager] Done applying all updates');
    resolveQueryPromiseWrapper();
    exports.queryPromise = queryPromiseWrapper = createQueryPromiseWrapper();
    (0, DeferredOnyxUpdates_1.clear)();
    isFetchingForPendingUpdates = false;
}
/**
 * Triggers the fetching process of either pending or missing updates.
 * @param onyxUpdatesFromServer the current update that is supposed to be applied
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 * @returns
 */
function handleMissingOnyxUpdates(onyxUpdatesFromServer, clientLastUpdateID) {
    var _a, _b, _c;
    // If isLoadingApp is positive it means that OpenApp command hasn't finished yet, and in that case
    // we don't have base state of the app (reports, policies, etc.) setup. If we apply this update,
    // we'll only have them overwritten by the openApp response. So let's skip it and return.
    if (isLoadingApp) {
        // When ONYX_UPDATES_FROM_SERVER is set, we pause the queue. Let's unpause
        // it so the app is not stuck forever without processing requests.
        (0, SequentialQueue_1.unpause)();
        console.debug("[OnyxUpdateManager] Ignoring Onyx updates while OpenApp hasn't finished yet.");
        return;
    }
    // This key is shared across clients, thus every client/tab will have a copy and try to execute this method.
    // It is very important to only process the missing onyx updates from leader client otherwise requests we'll execute
    // several duplicated requests that are not controlled by the SequentialQueue.
    if (!ActiveClientManager.isClientTheLeader()) {
        return;
    }
    // When there is no value or an invalid value, there's nothing to process, so let's return early.
    if (!(0, OnyxUpdatesFromServer_1.isValidOnyxUpdateFromServer)(onyxUpdatesFromServer)) {
        return;
    }
    // Check if one of these onyx updates is for the authToken. If it is, let's update our authToken now because our
    // current authToken is probably invalid.
    updateAuthTokenIfNecessary(onyxUpdatesFromServer);
    var shouldFetchPendingUpdates = (_a = onyxUpdatesFromServer === null || onyxUpdatesFromServer === void 0 ? void 0 : onyxUpdatesFromServer.shouldFetchPendingUpdates) !== null && _a !== void 0 ? _a : false;
    var lastUpdateIDFromServer = onyxUpdatesFromServer.lastUpdateID;
    var previousUpdateIDFromServer = onyxUpdatesFromServer.previousUpdateID;
    var lastUpdateIDFromClient = (_b = clientLastUpdateID !== null && clientLastUpdateID !== void 0 ? clientLastUpdateID : lastUpdateIDAppliedToClient) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    // Check if the client needs to send a backend request to fetch missing or pending updates and/or queue deferred updates.
    // Returns a boolean indicating whether we should execute the finally block after the promise is done,
    // in which the OnyxUpdateManager finishes its work and the SequentialQueue will is unpaused.
    var checkIfClientNeedsToBeUpdated = function () {
        // The OnyxUpdateManager can handle different types of re-fetch processes. Either there are pending updates,
        // that we need to fetch manually, or we detected gaps in the previously fetched updates.
        // Each of the flows below sets a promise through `DeferredOnyxUpdates.setMissingOnyxUpdatesQueryPromise`, which we further process.
        if (shouldFetchPendingUpdates) {
            // This flow handles the case where the server didn't send updates because the payload was too big.
            // We need to call the GetMissingOnyxUpdates query to fetch the missing updates up to the pendingLastUpdateID.
            var pendingUpdateID = Number(lastUpdateIDFromServer);
            isFetchingForPendingUpdates = true;
            // If the pendingUpdateID is not newer than the last locally applied update, we don't need to fetch the missing updates.
            if (pendingUpdateID <= lastUpdateIDFromClient) {
                (0, DeferredOnyxUpdates_1.setMissingOnyxUpdatesQueryPromise)(Promise.resolve());
                return true;
            }
            console.debug("[OnyxUpdateManager] Client is fetching pending updates from the server, from updates ".concat(lastUpdateIDFromClient, " to ").concat(Number(pendingUpdateID)));
            Log_1.default.info('There are pending updates from the server, so fetching incremental updates', true, {
                pendingUpdateID: pendingUpdateID,
                lastUpdateIDFromClient: lastUpdateIDFromClient,
            });
            // Get the missing Onyx updates from the server and afterward validate and apply the deferred updates.
            // This will trigger recursive calls to "validateAndApplyDeferredUpdates" if there are gaps in the deferred updates.
            (0, DeferredOnyxUpdates_1.setMissingOnyxUpdatesQueryPromise)((0, App_1.getMissingOnyxUpdates)(lastUpdateIDFromClient, lastUpdateIDFromServer).then(function () { return (0, utils_1.validateAndApplyDeferredUpdates)(clientLastUpdateID); }));
            return true;
        }
        if (!lastUpdateIDFromClient) {
            // This is the first time we're receiving an lastUpdateID, so we need to do a final ReconnectApp query before
            // This flow is setting the promise to a ReconnectApp query.
            // If there is a ReconnectApp query in progress, we should not start another one.
            if ((0, DeferredOnyxUpdates_1.getMissingOnyxUpdatesQueryPromise)()) {
                return false;
            }
            Log_1.default.info('Client has not gotten reliable updates before so reconnecting the app to start the process');
            // Since this is a full reconnectApp, we'll not apply the updates we received - those will come in the reconnect app request.
            (0, DeferredOnyxUpdates_1.setMissingOnyxUpdatesQueryPromise)((0, App_1.finalReconnectAppAfterActivatingReliableUpdates)());
            return true;
        }
        // This client already has the reliable updates mode enabled, but it's missing some updates and it needs to fetch those.
        // Therefore, we are calling the GetMissingOnyxUpdates query, to fetch the missing updates.
        var areDeferredUpdatesQueued = !(0, DeferredOnyxUpdates_1.isEmpty)();
        // Add the new update to the deferred updates
        (0, DeferredOnyxUpdates_1.enqueue)(onyxUpdatesFromServer, { shouldPauseSequentialQueue: false });
        // If there are deferred updates already, we don't need to fetch the missing updates again.
        if (areDeferredUpdatesQueued || isFetchingForPendingUpdates) {
            return false;
        }
        console.debug("[OnyxUpdateManager] Client is fetching missing updates from the server, from updates ".concat(lastUpdateIDFromClient, " to ").concat(Number(previousUpdateIDFromServer)));
        Log_1.default.info('Gap detected in update IDs from the server so fetching incremental updates', true, {
            lastUpdateIDFromClient: lastUpdateIDFromClient,
            lastUpdateIDFromServer: lastUpdateIDFromServer,
            previousUpdateIDFromServer: previousUpdateIDFromServer,
        });
        // Get the missing Onyx updates from the server and afterwards validate and apply the deferred updates.
        // This will trigger recursive calls to "validateAndApplyDeferredUpdates" if there are gaps in the deferred updates.
        (0, DeferredOnyxUpdates_1.setMissingOnyxUpdatesQueryPromise)((0, App_1.getMissingOnyxUpdates)(lastUpdateIDFromClient, previousUpdateIDFromServer).then(function () { return (0, utils_1.validateAndApplyDeferredUpdates)(clientLastUpdateID); }));
        return true;
    };
    var shouldFinalizeAndResume = checkIfClientNeedsToBeUpdated();
    if (shouldFinalizeAndResume) {
        (_c = (0, DeferredOnyxUpdates_1.getMissingOnyxUpdatesQueryPromise)()) === null || _c === void 0 ? void 0 : _c.finally(finalizeUpdatesAndResumeQueue);
    }
}
function updateAuthTokenIfNecessary(onyxUpdatesFromServer) {
    var _a, _b, _c;
    // Consolidate all of the given Onyx updates
    var onyxUpdates = [];
    (_a = onyxUpdatesFromServer === null || onyxUpdatesFromServer === void 0 ? void 0 : onyxUpdatesFromServer.updates) === null || _a === void 0 ? void 0 : _a.forEach(function (updateEvent) { return onyxUpdates.push.apply(onyxUpdates, updateEvent.data); });
    onyxUpdates.push.apply(onyxUpdates, ((_c = (_b = onyxUpdatesFromServer === null || onyxUpdatesFromServer === void 0 ? void 0 : onyxUpdatesFromServer.response) === null || _b === void 0 ? void 0 : _b.onyxData) !== null && _c !== void 0 ? _c : []));
    // Find any session updates
    var sessionUpdates = onyxUpdates === null || onyxUpdates === void 0 ? void 0 : onyxUpdates.filter(function (onyxUpdate) { return onyxUpdate.key === ONYXKEYS_1.default.SESSION; });
    // If any of the updates changes the authToken, let's update it now
    sessionUpdates === null || sessionUpdates === void 0 ? void 0 : sessionUpdates.forEach(function (sessionUpdate) {
        var _a, _b;
        var session = ((_a = sessionUpdate.value) !== null && _a !== void 0 ? _a : {});
        var newAuthToken = (_b = session.authToken) !== null && _b !== void 0 ? _b : '';
        if (!newAuthToken) {
            return;
        }
        Log_1.default.info('[OnyxUpdateManager] Found an authToken update while handling an Onyx update gap. Updating the authToken.');
        (0, updateSessionAuthTokens_1.default)(newAuthToken);
        (0, NetworkStore_1.setAuthToken)(newAuthToken);
    });
}
exports.default = (function () {
    console.debug('[OnyxUpdateManager] Listening for updates from the server');
    react_native_onyx_1.default.connect({
        key: ONYXKEYS_1.default.ONYX_UPDATES_FROM_SERVER,
        callback: function (value) { return handleMissingOnyxUpdates(value); },
    });
});
