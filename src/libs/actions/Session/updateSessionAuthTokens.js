"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateSessionAuthTokens;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function updateSessionAuthTokens(authToken, encryptedAuthToken) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { authToken: authToken, encryptedAuthToken: encryptedAuthToken, creationDate: new Date().getTime() });
}
