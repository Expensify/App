"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_image_picker_1 = require("react-native-image-picker");
var react_native_permissions_1 = require("react-native-permissions");
var types_1 = require("./types");
/**
 * Launching the camera for iOS involves checking for permissions
 * And only then starting the camera
 * If the user deny permission the callback will be called with an error response
 * in the same format as the error returned by react-native-image-picker
 */
var launchCamera = function (options, callback) {
    // Checks current camera permissions and prompts the user in case they aren't granted
    (0, react_native_permissions_1.request)(react_native_permissions_1.PERMISSIONS.IOS.CAMERA)
        .then(function (permission) {
        if (permission !== react_native_permissions_1.RESULTS.GRANTED) {
            throw new types_1.ErrorLaunchCamera('User did not grant permissions', 'permission');
        }
        (0, react_native_image_picker_1.launchCamera)(options, callback);
    })
        .catch(function (error) {
        /* Intercept the permission error as well as any other errors and call the callback
         * follow the same pattern expected for image picker results */
        callback({
            errorMessage: error.message,
            errorCode: error.errorCode || 'others',
        });
    });
};
exports.default = launchCamera;
