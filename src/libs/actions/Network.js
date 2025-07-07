"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIsOffline = setIsOffline;
exports.setShouldForceOffline = setShouldForceOffline;
exports.setConnectionChanges = setConnectionChanges;
exports.setShouldSimulatePoorConnection = setShouldSimulatePoorConnection;
exports.setPoorConnectionTimeoutID = setPoorConnectionTimeoutID;
exports.setShouldFailAllRequests = setShouldFailAllRequests;
exports.setTimeSkew = setTimeSkew;
exports.setNetWorkStatus = setNetWorkStatus;
exports.setNetworkLastOffline = setNetworkLastOffline;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setNetworkLastOffline(lastOfflineAt) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { lastOfflineAt: lastOfflineAt });
}
function setIsOffline(isNetworkOffline, reason) {
    if (reason === void 0) { reason = ''; }
    if (reason) {
        var textToLog = '[Network] Client is';
        textToLog += isNetworkOffline ? ' entering offline mode' : ' back online';
        textToLog += " because: ".concat(reason);
        Log_1.default.info(textToLog);
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: isNetworkOffline });
}
function setNetWorkStatus(status) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { networkStatus: status });
}
function setTimeSkew(skew) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { timeSkew: skew });
}
function setShouldForceOffline(shouldForceOffline) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { shouldForceOffline: shouldForceOffline });
}
/**
 * Test tool that will fail all network requests when enabled
 */
function setShouldFailAllRequests(shouldFailAllRequests) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { shouldFailAllRequests: shouldFailAllRequests });
}
function setPoorConnectionTimeoutID(poorConnectionTimeoutID) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { poorConnectionTimeoutID: poorConnectionTimeoutID });
}
function setShouldSimulatePoorConnection(shouldSimulatePoorConnection, poorConnectionTimeoutID) {
    if (!shouldSimulatePoorConnection) {
        clearTimeout(poorConnectionTimeoutID);
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { shouldSimulatePoorConnection: shouldSimulatePoorConnection, poorConnectionTimeoutID: undefined });
        return;
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { shouldSimulatePoorConnection: shouldSimulatePoorConnection });
}
function setConnectionChanges(connectionChanges) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { connectionChanges: connectionChanges });
}
