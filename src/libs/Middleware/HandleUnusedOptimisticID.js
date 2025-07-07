"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clone_1 = require("lodash/clone");
var deepReplaceKeysAndValues_1 = require("@libs/deepReplaceKeysAndValues");
var PersistedRequests = require("@userActions/PersistedRequests");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * This middleware checks for the presence of a field called preexistingReportID in the response.
 * If present, that means that the client passed an optimistic reportID with the request that the server did not use.
 * This can happen because there was already a report matching the parameters provided that the client didn't know about.
 * (i.e: a DM chat report with the same set of participants)
 *
 * If that happens, this middleware checks for any serialized network requests that reference the unused optimistic ID.
 * If it finds any, it replaces the unused optimistic ID with the "real ID" from the server.
 * That way these serialized requests function as expected rather than returning a 404.
 */
var handleUnusedOptimisticID = function (requestResponse, request, isFromSequentialQueue) {
    return requestResponse.then(function (response) {
        var _a;
        var responseOnyxData = (_a = response === null || response === void 0 ? void 0 : response.onyxData) !== null && _a !== void 0 ? _a : [];
        responseOnyxData.forEach(function (onyxData) {
            var _a, _b, _c;
            var key = onyxData.key;
            if (!(key === null || key === void 0 ? void 0 : key.startsWith(ONYXKEYS_1.default.COLLECTION.REPORT))) {
                return;
            }
            if (!onyxData.value) {
                return;
            }
            var report = onyxData.value;
            var preexistingReportID = report.preexistingReportID;
            if (!preexistingReportID) {
                return;
            }
            var oldReportID = (_a = key.split(ONYXKEYS_1.default.COLLECTION.REPORT).at(-1)) !== null && _a !== void 0 ? _a : (_b = request.data) === null || _b === void 0 ? void 0 : _b.reportID;
            if (isFromSequentialQueue) {
                var ongoingRequest = PersistedRequests.getOngoingRequest();
                if (ongoingRequest && ((_c = ongoingRequest.data) === null || _c === void 0 ? void 0 : _c.reportID) === oldReportID) {
                    var ongoingRequestClone = (0, clone_1.default)(ongoingRequest);
                    ongoingRequestClone.data = (0, deepReplaceKeysAndValues_1.default)(ongoingRequest.data, oldReportID, preexistingReportID);
                    PersistedRequests.updateOngoingRequest(ongoingRequestClone);
                }
            }
            PersistedRequests.getAll().forEach(function (persistedRequest, index) {
                var persistedRequestClone = (0, clone_1.default)(persistedRequest);
                persistedRequestClone.data = (0, deepReplaceKeysAndValues_1.default)(persistedRequest.data, oldReportID, preexistingReportID);
                PersistedRequests.update(index, persistedRequestClone);
            });
        });
        return response;
    });
};
exports.default = handleUnusedOptimisticID;
