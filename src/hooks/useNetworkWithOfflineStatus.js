"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useNetworkWithOfflineStatus;
var react_1 = require("react");
var useLocalize_1 = require("./useLocalize");
var useNetwork_1 = require("./useNetwork");
var usePrevious_1 = require("./usePrevious");
function useNetworkWithOfflineStatus() {
    var _a = (0, useNetwork_1.default)(), isOffline = _a.isOffline, lastOfflineAtFromOnyx = _a.lastOfflineAt;
    var prevIsOffline = (0, usePrevious_1.default)(isOffline);
    var getLocalDateFromDatetime = (0, useLocalize_1.default)().getLocalDateFromDatetime;
    // The last time/date the user went/was offline. If the user was never offline, it is set to undefined.
    var lastOfflineAt = (0, react_1.useRef)(isOffline ? lastOfflineAtFromOnyx : undefined);
    // The last time/date the user went/was online. If the user was never online, it is set to undefined.
    var lastOnlineAt = (0, react_1.useRef)(isOffline ? undefined : getLocalDateFromDatetime());
    (0, react_1.useEffect)(function () {
        // If the user has just gone offline (was online before but is now offline), update `lastOfflineAt` with the current local date/time.
        if (isOffline && !prevIsOffline) {
            lastOfflineAt.current = getLocalDateFromDatetime();
        }
        // If the user has just come back online (was offline before but is now online), update `lastOnlineAt` with the current local date/time.
        if (!isOffline && prevIsOffline) {
            lastOnlineAt.current = getLocalDateFromDatetime();
        }
    }, [isOffline, getLocalDateFromDatetime, prevIsOffline]);
    return { isOffline: isOffline, lastOfflineAt: lastOfflineAt, lastOnlineAt: lastOnlineAt };
}
