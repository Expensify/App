"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLocationPermission = requestLocationPermission;
exports.getLocationPermission = getLocationPermission;
var react_native_permissions_1 = require("react-native-permissions");
function requestLocationPermission() {
    return (0, react_native_permissions_1.request)(react_native_permissions_1.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}
function getLocationPermission() {
    return (0, react_native_permissions_1.check)(react_native_permissions_1.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}
