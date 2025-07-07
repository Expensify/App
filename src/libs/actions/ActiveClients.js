"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActiveClients = setActiveClients;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setActiveClients(activeClients) {
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.ACTIVE_CLIENTS, activeClients);
}
