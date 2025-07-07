"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var encryptedAuthToken = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (session) { var _a; return (encryptedAuthToken = (_a = session === null || session === void 0 ? void 0 : session.encryptedAuthToken) !== null && _a !== void 0 ? _a : ''); },
});
/**
 * Add encryptedAuthToken to this attachment URL
 */
function default_1(url, hasOtherParameters) {
    if (hasOtherParameters === void 0) { hasOtherParameters = false; }
    var symbol = hasOtherParameters ? '&' : '?';
    return "".concat(url).concat(symbol, "encryptedAuthToken=").concat(encodeURIComponent(encryptedAuthToken));
}
