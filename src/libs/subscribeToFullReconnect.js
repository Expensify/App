"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var App_1 = require("./actions/App");
var Log_1 = require("./Log");
var lastFullReconnectTime = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.LAST_FULL_RECONNECT_TIME,
    callback: function (value) {
        lastFullReconnectTime = value !== null && value !== void 0 ? value : '';
        doFullReconnectIfNecessary();
    },
});
var reconnectAppIfFullReconnectBefore = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    callback: function (value) {
        reconnectAppIfFullReconnectBefore = value !== null && value !== void 0 ? value : '';
        doFullReconnectIfNecessary();
    },
});
function doFullReconnectIfNecessary() {
    if (lastFullReconnectTime >= reconnectAppIfFullReconnectBefore) {
        return;
    }
    Log_1.default.info('Full reconnect triggered', false, { lastFullReconnectTime: lastFullReconnectTime, reconnectAppIfFullReconnectBefore: reconnectAppIfFullReconnectBefore });
    (0, App_1.reconnectApp)();
}
