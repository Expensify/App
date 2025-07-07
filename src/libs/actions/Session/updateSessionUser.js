"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateSessionUser;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function updateSessionUser(accountID, email) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: accountID, email: email });
}
