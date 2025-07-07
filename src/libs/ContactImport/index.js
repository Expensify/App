"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_permissions_1 = require("react-native-permissions");
var contactImport = function () {
    return Promise.resolve({
        contactList: [],
        permissionStatus: react_native_permissions_1.RESULTS.UNAVAILABLE,
    });
};
exports.default = contactImport;
