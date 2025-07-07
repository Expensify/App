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
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@libs/API/types");
var OnyxUpdates = require("@userActions/OnyxUpdates");
var CONST_1 = require("@src/CONST");
// If we're executing any of these requests, we don't need to trigger our OnyxUpdates flow to update the current data even if our current value is out of
// date because all these requests are updating the app to the most current state.
var requestsToIgnoreLastUpdateID = [
    types_1.WRITE_COMMANDS.OPEN_APP,
    types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
    types_1.WRITE_COMMANDS.CLOSE_ACCOUNT,
    types_1.WRITE_COMMANDS.DELETE_MONEY_REQUEST,
    types_1.SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES,
];
var SaveResponseInOnyx = function (requestResponse, request) {
    return requestResponse.then(function (response) {
        var _a, _b, _c, _d;
        if (response === void 0) { response = {}; }
        var onyxUpdates = (_a = response === null || response === void 0 ? void 0 : response.onyxData) !== null && _a !== void 0 ? _a : [];
        // Sometimes we call requests that are successful but they don't have any response or any success/failure/finally data to set. Let's return early since
        // we don't need to store anything here.
        if (!onyxUpdates && !request.successData && !request.failureData && !request.finallyData) {
            return Promise.resolve(response);
        }
        var responseToApply = {
            type: CONST_1.default.ONYX_UPDATE_TYPES.HTTPS,
            lastUpdateID: Number((_b = response === null || response === void 0 ? void 0 : response.lastUpdateID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID),
            previousUpdateID: Number((_c = response === null || response === void 0 ? void 0 : response.previousUpdateID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID),
            request: request,
            response: response !== null && response !== void 0 ? response : {},
        };
        if (requestsToIgnoreLastUpdateID.includes(request.command) ||
            !OnyxUpdates.doesClientNeedToBeUpdated({ previousUpdateID: Number((_d = response === null || response === void 0 ? void 0 : response.previousUpdateID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID) })) {
            return OnyxUpdates.apply(responseToApply);
        }
        // Save the update IDs to Onyx so they can be used to fetch incremental updates if the client gets out of sync from the server
        OnyxUpdates.saveUpdateInformation(responseToApply);
        // Ensure the queue is paused while the client resolves the gap in onyx updates so that updates are guaranteed to happen in a specific order.
        return Promise.resolve(__assign(__assign({}, response), { shouldPauseQueue: true }));
    });
};
exports.default = SaveResponseInOnyx;
