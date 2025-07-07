"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = apply;
exports.doesClientNeedToBeUpdated = doesClientNeedToBeUpdated;
exports.saveUpdateInformation = saveUpdateInformation;
exports.INTERNAL_DO_NOT_USE_applyHTTPSOnyxUpdates = applyHTTPSOnyxUpdates;
var react_native_onyx_1 = require("react-native-onyx");
var types_1 = require("@libs/API/types");
var Log_1 = require("@libs/Log");
var Performance_1 = require("@libs/Performance");
var PusherUtils_1 = require("@libs/PusherUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var QueuedOnyxUpdates_1 = require("./QueuedOnyxUpdates");
// This key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated. If that
// callback were triggered it would lead to duplicate processing of server updates.
var lastUpdateIDAppliedToClient = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: function (val) { return (lastUpdateIDAppliedToClient = val); },
});
// This promise is used to ensure pusher events are always processed in the order they are received,
// even when such events are received over multiple separate pusher updates.
var pusherEventsPromise = Promise.resolve();
var airshipEventsPromise = Promise.resolve();
function applyHTTPSOnyxUpdates(request, response) {
    var _a;
    Performance_1.default.markStart(CONST_1.default.TIMING.APPLY_HTTPS_UPDATES);
    console.debug('[OnyxUpdateManager] Applying https update');
    // For most requests we can immediately update Onyx. For write requests we queue the updates and apply them after the sequential queue has flushed to prevent a replay effect in
    // the UI. See https://github.com/Expensify/App/issues/12775 for more info.
    var updateHandler = ((_a = request === null || request === void 0 ? void 0 : request.data) === null || _a === void 0 ? void 0 : _a.apiRequestType) === CONST_1.default.API_REQUEST_TYPE.WRITE ? QueuedOnyxUpdates_1.queueOnyxUpdates : react_native_onyx_1.default.update;
    // First apply any onyx data updates that are being sent back from the API. We wait for this to complete and then
    // apply successData or failureData. This ensures that we do not update any pending, loading, or other UI states contained
    // in successData/failureData until after the component has received and API data.
    var onyxDataUpdatePromise = response.onyxData ? updateHandler(response.onyxData) : Promise.resolve();
    return onyxDataUpdatePromise
        .then(function () {
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
                Log_1.default.info('[OnyxUpdateManager] Received 460 status code, not applying failure data');
                return Promise.resolve();
            }
            return updateHandler(request.failureData);
        }
        return Promise.resolve();
    })
        .then(function () {
        if (request.finallyData) {
            return updateHandler(request.finallyData);
        }
        return Promise.resolve();
    })
        .then(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.APPLY_HTTPS_UPDATES);
        console.debug('[OnyxUpdateManager] Done applying HTTPS update');
        return Promise.resolve(response);
    });
}
function applyPusherOnyxUpdates(updates) {
    Performance_1.default.markStart(CONST_1.default.TIMING.APPLY_PUSHER_UPDATES);
    pusherEventsPromise = pusherEventsPromise.then(function () {
        console.debug('[OnyxUpdateManager] Applying pusher update');
    });
    pusherEventsPromise = updates
        .reduce(function (promise, update) { return promise.then(function () { return PusherUtils_1.default.triggerMultiEventHandler(update.eventType, update.data); }); }, pusherEventsPromise)
        .then(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.APPLY_PUSHER_UPDATES);
        console.debug('[OnyxUpdateManager] Done applying Pusher update');
    });
    return pusherEventsPromise;
}
function applyAirshipOnyxUpdates(updates) {
    Performance_1.default.markStart(CONST_1.default.TIMING.APPLY_AIRSHIP_UPDATES);
    airshipEventsPromise = airshipEventsPromise.then(function () {
        console.debug('[OnyxUpdateManager] Applying Airship updates');
    });
    airshipEventsPromise = updates
        .reduce(function (promise, update) { return promise.then(function () { return react_native_onyx_1.default.update(update.data); }); }, airshipEventsPromise)
        .then(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.APPLY_AIRSHIP_UPDATES);
        console.debug('[OnyxUpdateManager] Done applying Airship updates');
    });
    return airshipEventsPromise;
}
function apply(_a) {
    var _b;
    var lastUpdateID = _a.lastUpdateID, type = _a.type, request = _a.request, response = _a.response, updates = _a.updates;
    Log_1.default.info("[OnyxUpdateManager] Applying update type: ".concat(type, " with lastUpdateID: ").concat(lastUpdateID), false, { command: request === null || request === void 0 ? void 0 : request.command });
    var isUpdateOld = lastUpdateID && lastUpdateIDAppliedToClient && Number(lastUpdateID) <= lastUpdateIDAppliedToClient;
    var isOpenAppRequest = (request === null || request === void 0 ? void 0 : request.command) === types_1.WRITE_COMMANDS.OPEN_APP;
    var isFullReconnectRequest = (request === null || request === void 0 ? void 0 : request.command) === types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP && !((_b = request === null || request === void 0 ? void 0 : request.data) === null || _b === void 0 ? void 0 : _b.updateIDFrom);
    if (isUpdateOld && !isOpenAppRequest && !isFullReconnectRequest) {
        Log_1.default.info('[OnyxUpdateManager] Update received was older than or the same as current state, returning without applying the updates other than successData and failureData', false, {
            lastUpdateID: lastUpdateID,
            lastUpdateIDAppliedToClient: lastUpdateIDAppliedToClient,
        });
        // In this case, we're already received the OnyxUpdate included in the response, so we don't need to apply it again.
        // However, we do need to apply the successData and failureData from the request
        if (type === CONST_1.default.ONYX_UPDATE_TYPES.HTTPS &&
            request &&
            response &&
            (!(0, EmptyObject_1.isEmptyObject)(request.successData) || !(0, EmptyObject_1.isEmptyObject)(request.failureData) || !(0, EmptyObject_1.isEmptyObject)(request.finallyData))) {
            Log_1.default.info('[OnyxUpdateManager] Applying success or failure data from request without onyxData from response');
            // We use a spread here instead of delete because we don't want to change the response for other middlewares
            var onyxData = response.onyxData, responseWithoutOnyxData = __rest(response, ["onyxData"]);
            return applyHTTPSOnyxUpdates(request, responseWithoutOnyxData);
        }
        return Promise.resolve();
    }
    if (lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }
    if (type === CONST_1.default.ONYX_UPDATE_TYPES.HTTPS && request && response) {
        return applyHTTPSOnyxUpdates(request, response);
    }
    if (type === CONST_1.default.ONYX_UPDATE_TYPES.PUSHER && updates) {
        return applyPusherOnyxUpdates(updates);
    }
    if (type === CONST_1.default.ONYX_UPDATE_TYPES.AIRSHIP && updates) {
        return applyAirshipOnyxUpdates(updates);
    }
}
/**
 * @param [updateParams.request] Exists if updateParams.type === 'https'
 * @param [updateParams.response] Exists if updateParams.type === 'https'
 * @param [updateParams.updates] Exists if updateParams.type === 'pusher'
 */
function saveUpdateInformation(updateParams) {
    var _a, _b;
    var modifiedUpdateParams = updateParams;
    // We don't want to store the data in the updateParams if it's a HTTPS update since it is useless anyways
    // and it causes serialization issues when storing in Onyx
    if (updateParams.type === CONST_1.default.ONYX_UPDATE_TYPES.HTTPS && updateParams.request) {
        modifiedUpdateParams = __assign(__assign({}, modifiedUpdateParams), { request: __assign(__assign({}, updateParams.request), { data: { apiRequestType: (_b = (_a = updateParams.request) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.apiRequestType } }) });
    }
    // Always use set() here so that the updateParams are never merged and always unique to the request that came in
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_FROM_SERVER, modifiedUpdateParams);
}
/**
 * This function will receive the previousUpdateID from any request/pusher update that has it, compare to our current app state
 * and return if an update is needed
 * @param previousUpdateID The previousUpdateID contained in the response object
 * @param clientLastUpdateID an optional override for the lastUpdateIDAppliedToClient
 */
function doesClientNeedToBeUpdated(_a) {
    var previousUpdateID = _a.previousUpdateID, clientLastUpdateID = _a.clientLastUpdateID;
    // If no previousUpdateID is sent, this is not a WRITE request so we don't need to update our current state
    if (!previousUpdateID) {
        return false;
    }
    var lastUpdateIDFromClient = clientLastUpdateID !== null && clientLastUpdateID !== void 0 ? clientLastUpdateID : lastUpdateIDAppliedToClient;
    // If we don't have any value in lastUpdateIDFromClient, this is the first time we're receiving anything, so we need to do a last reconnectApp
    if (!lastUpdateIDFromClient) {
        Log_1.default.info('We do not have lastUpdateIDFromClient, client needs updating');
        return true;
    }
    if (lastUpdateIDFromClient < previousUpdateID) {
        Log_1.default.info('lastUpdateIDFromClient is less than the previousUpdateID received, client needs updating', false, { lastUpdateIDFromClient: lastUpdateIDFromClient, previousUpdateID: previousUpdateID });
        return true;
    }
    return false;
}
