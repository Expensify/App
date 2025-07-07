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
exports.default = useNetwork;
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useNetwork(_a) {
    var _b;
    var _c = _a === void 0 ? {} : _a, _d = _c.onReconnect, onReconnect = _d === void 0 ? function () { } : _d;
    var callback = (0, react_1.useRef)(onReconnect);
    // eslint-disable-next-line react-compiler/react-compiler
    callback.current = onReconnect;
    var network = (0, useOnyx_1.default)(ONYXKEYS_1.default.NETWORK, {
        selector: function (networkData) {
            if (!networkData) {
                return __assign(__assign({}, CONST_1.default.DEFAULT_NETWORK_DATA), { networkStatus: CONST_1.default.NETWORK.NETWORK_STATUS.UNKNOWN });
            }
            return {
                isOffline: networkData.isOffline,
                networkStatus: networkData.networkStatus,
                lastOfflineAt: networkData.lastOfflineAt,
            };
        },
        canBeMissing: true,
    })[0];
    // Extract values with proper defaults
    var isOffline = (_b = network === null || network === void 0 ? void 0 : network.isOffline) !== null && _b !== void 0 ? _b : false;
    var networkStatus = network === null || network === void 0 ? void 0 : network.networkStatus;
    var lastOfflineAt = network === null || network === void 0 ? void 0 : network.lastOfflineAt;
    var prevOfflineStatusRef = (0, react_1.useRef)(isOffline);
    (0, react_1.useEffect)(function () {
        // If we were offline before and now we are not offline then we just reconnected
        var didReconnect = prevOfflineStatusRef.current && !isOffline;
        if (!didReconnect) {
            return;
        }
        callback.current();
    }, [isOffline]);
    (0, react_1.useEffect)(function () {
        // Used to store previous prop values to compare on next render
        prevOfflineStatusRef.current = isOffline;
    }, [isOffline]);
    // If the network status is undefined, we don't treat it as offline. Otherwise, we utilize the isOffline prop.
    return { isOffline: networkStatus === CONST_1.default.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOffline, lastOfflineAt: lastOfflineAt };
}
