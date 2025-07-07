"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_permissions_1 = require("react-native-permissions");
function requestCameraPermission() {
    return (0, react_native_permissions_1.request)(react_native_permissions_1.PERMISSIONS.IOS.CAMERA);
}
function getCameraPermissionStatus() {
    return (0, react_native_permissions_1.check)(react_native_permissions_1.PERMISSIONS.IOS.CAMERA);
}
var CameraPermission = {
    requestCameraPermission: requestCameraPermission,
    getCameraPermissionStatus: getCameraPermissionStatus,
};
exports.default = CameraPermission;
