"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useLoadingBarVisibility;
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useNetwork_1 = require("./useNetwork");
var useOnyx_1 = require("./useOnyx");
// Commands that should trigger the LoadingBar to show
var RELEVANT_COMMANDS = new Set([types_1.WRITE_COMMANDS.OPEN_APP, types_1.WRITE_COMMANDS.RECONNECT_APP, types_1.WRITE_COMMANDS.OPEN_REPORT, types_1.WRITE_COMMANDS.READ_NEWEST_ACTION]);
/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when any of the RELEVANT_COMMANDS are being processed
 */
function useLoadingBarVisibility() {
    var persistedRequests = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSISTED_REQUESTS, { canBeMissing: false })[0];
    var ongoingRequests = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSISTED_ONGOING_REQUESTS, { canBeMissing: false })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    // Don't show loading bar if currently offline
    if (isOffline) {
        return false;
    }
    var hasPersistedRequests = !!(persistedRequests === null || persistedRequests === void 0 ? void 0 : persistedRequests.some(function (request) { return RELEVANT_COMMANDS.has(request.command) && !request.initiatedOffline; }));
    var hasOngoingRequests = !!ongoingRequests && RELEVANT_COMMANDS.has(ongoingRequests === null || ongoingRequests === void 0 ? void 0 : ongoingRequests.command);
    return hasPersistedRequests || hasOngoingRequests;
}
