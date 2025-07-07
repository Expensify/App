"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var differenceInMilliseconds_1 = require("date-fns/differenceInMilliseconds");
var react_error_boundary_1 = require("react-error-boundary");
var CONST_1 = require("@src/CONST");
var usePageRefresh = function () {
    var resetBoundary = (0, react_error_boundary_1.useErrorBoundary)().resetBoundary;
    return function (isChunkLoadError) {
        var _a;
        var lastRefreshTimestamp = JSON.parse((_a = sessionStorage.getItem(CONST_1.default.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP)) !== null && _a !== void 0 ? _a : 'null');
        if (!isChunkLoadError && (lastRefreshTimestamp === null || (0, differenceInMilliseconds_1.differenceInMilliseconds)(Date.now(), Number(lastRefreshTimestamp)) > CONST_1.default.ERROR_WINDOW_RELOAD_TIMEOUT)) {
            resetBoundary();
            sessionStorage.setItem(CONST_1.default.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP, Date.now().toString());
            return;
        }
        window.location.reload();
        sessionStorage.removeItem(CONST_1.default.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP);
    };
};
exports.default = usePageRefresh;
