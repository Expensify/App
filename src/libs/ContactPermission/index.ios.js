"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContactPermission = requestContactPermission;
exports.getContactPermission = getContactPermission;
var react_native_permissions_1 = require("react-native-permissions");
function requestContactPermission() {
    return (0, react_native_permissions_1.request)(react_native_permissions_1.PERMISSIONS.IOS.CONTACTS);
}
function getContactPermission() {
    return (0, react_native_permissions_1.check)(react_native_permissions_1.PERMISSIONS.IOS.CONTACTS);
}
